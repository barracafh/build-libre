// Las votaciones agrupadas en iniciativas (mismo expediente, o mismo título sin «(punto N)»), con
// qué votó cada grupo en cada una y quién la propuso. Y una frase de plantilla por grupo y cuestión.
//
// Solo servidor: lee el disco a través de datos.ts y cuestiones.ts.
//
// - Sin IA: la frase sale de una plantilla con recuentos, sin adjetivos ni valoraciones.
// - Un grupo sin posición en una votación cuenta como «no vota», igual que conteoPorPartido.

import { conteoPorPartido, cuestionesDeTema, porIniciativa, sinPunto, type Cuestion } from "./cuestiones.ts";
import { partidos, votacion, type Posicion, type ResumenVotacion } from "./datos.ts";

export type PosicionIniciativa = Posicion | "V"; // «V»: el grupo votó distinto según el punto

export const ETIQUETA_INICIATIVA: Record<PosicionIniciativa, string> = {
  S: "A favor",
  N: "En contra",
  A: "Abstención",
  X: "No vota",
  D: "Dividido",
  V: "Según el punto",
};

export type Iniciativa = {
  id: string;
  titulo: string;
  tipo: string;
  proponente: string | null;
  proponenteNombre: string | null;
  fecha: string;
  votaciones: ResumenVotacion[];
  posiciones: Record<string, PosicionIniciativa>;
};

export type Apoyo = {
  aFavor: Iniciativa[];
  enContra: Iniciativa[];
  abstencion: Iniciativa[];
  segunPunto: Iniciativa[];
  dividido: Iniciativa[];
  noVota: Iniciativa[];
};

// El valor más repetido, o null si no hay ninguno; a igualdad, el primero que aparece.
function masFrecuente(valores: (string | null | undefined)[]): string | null {
  const n = new Map<string, number>();
  for (const v of valores) if (v) n.set(v, (n.get(v) ?? 0) + 1);
  let mejor: string | null = null;
  for (const [v, c] of n) if (mejor === null || c > n.get(mejor)!) mejor = v;
  return mejor;
}

export function nombreProponente(codigo: string | null): string | null {
  if (!codigo) return null;
  if (codigo === "GOB") return "Gobierno";
  if (codigo === "MIXTO") return "Grupo Mixto";
  return partidos().find((p) => p.codigo === codigo)?.nombre ?? codigo;
}

function posicionDe(codigo: string, lista: ResumenVotacion[]): PosicionIniciativa {
  const ps = new Set(lista.map((v) => v.partidos[codigo] ?? "X"));
  if (ps.has("D")) return "D";
  return ps.size === 1 ? [...ps][0] : "V";
}

const ELIPSIS = /\s*(…|\.\.\.)\s*$/;

// Algunos títulos llegan cortados con «…»: se usa el texto oficial de esa votación, o se quita la elipsis.
function tituloCompleto(nombre: string, vs: ResumenVotacion[]): string {
  if (!ELIPSIS.test(nombre)) return nombre;
  const v = vs.find((x) => sinPunto(x.titulo) === nombre) ?? vs[0];
  const texto = sinPunto(votacion(v.id)?.texto.trim() ?? "");
  return texto && !ELIPSIS.test(texto) ? texto : nombre.replace(ELIPSIS, "");
}

export function iniciativasDeVotaciones(lista: ResumenVotacion[]): Iniciativa[] {
  const codigos = partidos().map((p) => p.codigo);
  // porIniciativa ya agrupa, ordena (más reciente primero) y elige el título.
  return porIniciativa(lista).map(({ nombre, votaciones: vs }) => {
    const proponente = masFrecuente(vs.map((v) => votacion(v.id)?.proponente));
    return {
      id: vs[0].exp ?? `votacion-${vs[0].id}`,
      titulo: tituloCompleto(nombre, vs),
      tipo: masFrecuente(vs.map((v) => v.tipo)) ?? vs[0].tipo,
      proponente,
      proponenteNombre: nombreProponente(proponente),
      fecha: vs[0].fecha,
      votaciones: vs,
      posiciones: Object.fromEntries(codigos.map((c) => [c, posicionDe(c, vs)])),
    };
  });
}

export const iniciativasDeCuestion = (c: Cuestion): Iniciativa[] => iniciativasDeVotaciones(c.votaciones);

export const iniciativasDeTema = (slug: string): Iniciativa[] =>
  iniciativasDeVotaciones(cuestionesDeTema(slug).flatMap((c) => c.votaciones));

const LISTA: Record<PosicionIniciativa, keyof Apoyo> = {
  S: "aFavor",
  N: "enContra",
  A: "abstencion",
  V: "segunPunto",
  D: "dividido",
  X: "noVota",
};

export function apoyoPorPartido(iniciativas: Iniciativa[]): Record<string, Apoyo> {
  const r: Record<string, Apoyo> = {};
  for (const { codigo } of partidos()) {
    const a: Apoyo = { aFavor: [], enContra: [], abstencion: [], segunPunto: [], dividido: [], noVota: [] };
    for (const i of iniciativas) a[LISTA[i.posiciones[codigo] ?? "X"]].push(i);
    r[codigo] = a;
  }
  return r;
}

// «a, b y c»
const enumerar = (xs: string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} y ${xs.at(-1)}`);

// «de EH Bildu», «del Grupo Popular», «del Gobierno».
const conDe = (nombre: string) => (/^(Grupo|Gobierno)\b/.test(nombre) ? `del ${nombre}` : `de ${nombre}`);

const minusculaInicial = (s: string) => (/^\p{Lu}\p{Ll}/u.test(s) ? s[0].toLowerCase() + s.slice(1) : s);

function deQuien(codigo: string, lista: Iniciativa[]): string | null {
  const conProponente = lista.filter((i) => i.proponente);
  if (!conProponente.length) return null;
  const propio = conProponente.some((i) => i.proponente === codigo);
  const otros = [...new Set(conProponente.filter((i) => i.proponente !== codigo).map((i) => i.proponenteNombre!))]
    .sort((a, b) => a.localeCompare(b, "es"))
    .map(conDe);
  if (propio) otros.push("de su propio grupo");
  return `${conProponente.length === 1 ? "una iniciativa" : "iniciativas"} ${enumerar(otros)}`;
}

export function fraseApoyo(codigo: string, cuestion: Cuestion): string | null {
  const total = cuestion.votaciones.length;
  const c = conteoPorPartido(cuestion.votaciones)[codigo];
  if (!total || !c || c.S + c.N + c.A + c.D === 0) return null;

  const otras = /^Otras votaciones sobre /.exec(cuestion.nombre);
  const asunto = otras ? cuestion.nombre.slice(otras[0].length) : minusculaInicial(cuestion.nombre);
  const inicio = otras
    ? total === 1 ? `En 1 otra votación sobre ${asunto}` : `En las ${total} otras votaciones sobre ${asunto}`
    : total === 1 ? `En 1 votación sobre ${asunto}` : `En las ${total} votaciones sobre ${asunto}`;

  const partes: string[] = [];
  if (c.S) partes.push(`a favor en ${c.S}`);
  if (c.N) partes.push(`en contra en ${c.N}`);
  if (partes.length) partes[0] = `votó ${partes[0]}`;
  if (c.A) partes.push(`se abstuvo en ${c.A}`);
  if (c.D) partes.push(`en ${c.D} el grupo votó dividido`);
  if (c.X) partes.push(`no votó en ${c.X}`);
  let frase = `${inicio}, ${enumerar(partes)}.`;

  const apoyo = apoyoPorPartido(iniciativasDeCuestion(cuestion))[codigo];
  const favor = deQuien(codigo, apoyo.aFavor);
  const contra = deQuien(codigo, apoyo.enContra);
  if (favor && contra) frase += ` Votó a favor de ${favor}, y en contra de ${contra}.`;
  else if (favor) frase += ` Votó a favor de ${favor}.`;
  else if (contra) frase += ` Votó en contra de ${contra}.`;
  return frase;
}
