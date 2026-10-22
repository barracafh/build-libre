// Las votaciones de cada tema agrupadas en cuestiones, para no listar decenas de votos sueltos.
//
// Solo servidor: lee el disco, así que se llama desde Server Components en el build.
//
// - Las reglas están en src/datos/cuestiones.json: por tema, cuestiones con palabras clave.
//   Sin IA: una votación va a la primera cuestión cuyas palabras aparezcan en su título o texto,
//   sin distinguir mayúsculas ni tildes, y siempre al principio de una palabra («hipotec» encuentra
//   «hipotecarios», «IVA» no encuentra «privada»).
// - Lo que no encaja en ninguna regla va a «Otras votaciones sobre <tema>».
// - Un tema sin reglas se agrupa por iniciativa: mismo expediente, o mismo título sin «(punto N)».
// - Los nombres de las cuestiones describen el asunto, nunca una postura.

import { readFileSync } from "node:fs";
import { join } from "node:path";

import { partidos, resumenes, TEMAS, votaciones, type Posicion, type ResumenVotacion } from "./datos.ts";

export type Cuestion = { slug: string; nombre: string; votaciones: ResumenVotacion[] };
export type Conteo = Record<Posicion, number>;
export type Tema = { slug: string; nombre: string; votaciones: number; cuestiones: number };

type Regla = { slug: string; nombre: string; palabras: string[] };

export const normalizar = (s: string) =>
  s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

// Cada palabra se busca al principio de una palabra del texto ya normalizado.
export function patron(palabras: string[]): RegExp {
  const alternativas = palabras.map((p) => normalizar(p).replace(/[.*+?^${}()|[\]\\/]/g, "\\$&"));
  return new RegExp(`(?:^|[^\\p{L}\\p{N}])(?:${alternativas.join("|")})`, "u");
}

const SUFIJO_PUNTO = /\s*\((?:punto|resto)[^)]*\)?\s*$/i;
export const sinPunto = (titulo: string) => titulo.replace(SUFIJO_PUNTO, "");

const TRAMITE = /^(votaci[oó]n|tramitar|solicitud de avocaci[oó]n|acuerdo de tramitaci[oó]n)\b/i;

const numeros =(id: string) => id.split("-").map(Number);

// Más reciente primero: por fecha y, el mismo día, por sesión y número de votación.
export function recientesPrimero(a: ResumenVotacion, b: ResumenVotacion): number {
  if (a.fecha !== b.fecha) return b.fecha.localeCompare(a.fecha);
  const [sa, va] = numeros(a.id);
  const [sb, vb] = numeros(b.id);
  return sb - sa || vb - va;
}

export function porIniciativa(lista: ResumenVotacion[]): Cuestion[] {
  const grupos = new Map<string, ResumenVotacion[]>();
  for (const v of lista) {
    const clave = v.exp ? `exp:${v.exp}` : `titulo:${normalizar(sinPunto(v.titulo))}`;
    grupos.set(clave, [...(grupos.get(clave) ?? []), v]);
  }
  return [...grupos.values()]
    .map((vs) => {
      vs.sort(recientesPrimero);
      // El título más corto, evitando los de trámite («Votación de…», «Tramitar…») si hay otro.
      const titulos = vs.map((v) => sinPunto(v.titulo));
      const propios = titulos.filter((t) => !TRAMITE.test(t));
      const nombre = (propios.length ? propios : titulos).reduce((a, b) => (b.length < a.length ? b : a));
      const slug = vs[0].exp ? `exp-${vs[0].exp.replace(/[^\w]+/g, "-")}` : `votacion-${vs[0].id}`;
      return { slug, nombre, votaciones: vs };
    })
    .sort((a, b) => recientesPrimero(a.votaciones[0], b.votaciones[0]));
}

export function agrupar(
  lista: ResumenVotacion[],
  reglas: Regla[],
  textos: Map<string, string>,
  nombreTema: string,
): Cuestion[] {
  if (!reglas.length) return porIniciativa(lista);
  const cuestiones = reglas.map((r) => ({ regla: r, re: patron(r.palabras), votaciones: [] as ResumenVotacion[] }));
  const otras: ResumenVotacion[] = [];
  for (const v of lista) {
    const texto = normalizar(`${v.titulo} ${textos.get(v.id) ?? ""}`);
    (cuestiones.find((c) => c.re.test(texto))?.votaciones ?? otras).push(v);
  }
  const resultado: Cuestion[] = cuestiones
    .filter((c) => c.votaciones.length)
    .map((c) => ({ slug: c.regla.slug, nombre: c.regla.nombre, votaciones: c.votaciones.sort(recientesPrimero) }));
  if (otras.length) {
    resultado.push({
      slug: "otras",
      nombre: `Otras votaciones sobre ${nombreTema[0].toLowerCase()}${nombreTema.slice(1)}`,
      votaciones: otras.sort(recientesPrimero),
    });
  }
  return resultado;
}

let cache: ReturnType<typeof cargar> | undefined;

function cargar() {
  const reglas = JSON.parse(
    readFileSync(join(process.cwd(), "src", "datos", "cuestiones.json"), "utf8"),
  ) as Record<string, Regla[]>;
  const textos = new Map(votaciones().map((v) => [v.id, v.texto]));
  const todas = resumenes();

  const porTema = new Map<string, Cuestion[]>();
  const temas: Tema[] = Object.entries(TEMAS)
    .map(([slug, nombre]) => {
      const lista = todas.filter((v) => v.temas.includes(slug));
      const cuestiones = agrupar(lista, reglas[slug] ?? [], textos, nombre);
      porTema.set(slug, cuestiones);
      return { slug, nombre, votaciones: lista.length, cuestiones: cuestiones.length };
    })
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

  return { temas, porTema };
}

const datos = () => (cache ??= cargar());

// Los 21 temas en orden alfabético, con cuántas votaciones y cuestiones tiene cada uno.
export const temas = (): Tema[] => datos().temas;

export const tema = (slug: string): Tema | undefined => datos().temas.find((t) => t.slug === slug);

export const cuestionesDeTema = (slug: string): Cuestion[] => datos().porTema.get(slug) ?? [];

// Cuántas veces votó cada grupo a favor, en contra, abstención, dividido o no votó.
// Un grupo sin posición en una votación cuenta como «no vota», así cada fila suma el total.
export function conteoPorPartido(lista: ResumenVotacion[]): Record<string, Conteo> {
  const conteo: Record<string, Conteo> = {};
  for (const { codigo } of partidos()) {
    const c: Conteo = { S: 0, N: 0, A: 0, X: 0, D: 0 };
    for (const v of lista) c[v.partidos[codigo] ?? "X"]++;
    conteo[codigo] = c;
  }
  return conteo;
}
