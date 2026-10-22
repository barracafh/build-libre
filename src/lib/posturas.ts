// La postura de cada grupo ante medidas concretas de un tema, sacada de sus votos.
//
// Solo servidor: lee src/datos/posturas/<tema>.json en el build.
//
// - Cada tema tiene «enunciados»: medidas concretas redactadas sin adjetivos. Cada iniciativa del
//   tema se asigna a mano a un enunciado (o a ninguno) con una dirección: 1 si votar Sí es estar a
//   favor de la medida, -1 si votar Sí es estar en contra.
// - Sin IA en la web: la postura sale de contar votos. scripts/posturas.ts propone asignaciones con
//   IA, pero solo escribe <tema>.propuesto.json, que esta librería no lee.
// - Asignaciones con una iniciativa que ya no está en el tema se ignoran con un aviso.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { partidos } from "./datos.ts";
import { iniciativasDeTema, type Iniciativa, type PosicionIniciativa } from "./iniciativas.ts";

export type Enunciado = { slug: string; texto: string };
export type Asignacion = {
  iniciativa: string;
  enunciado: string;
  direccion: 1 | -1;
  nota?: string;
  revisar?: boolean; // dudosa: que la revise una persona
};
export type SinEnunciado = { iniciativa: string; nota: string };
export type FicheroPosturas = {
  tema: string;
  enunciados: Enunciado[];
  asignaciones: Asignacion[];
  sinEnunciado?: SinEnunciado[];
};

export type Sentido = "F" | "C" | "A" | "V" | "X"; // F a favor de la medida, C en contra, A abstención, V dividido/según el punto, X no votó
export type Postura = "F" | "C" | "M" | "A" | "V" | "S"; // F a favor, C en contra, M mixta, A se abstuvo, V según el punto, S sin votaciones

export const ETIQUETA_POSTURA: Record<Postura, string> = {
  F: "A favor",
  C: "En contra",
  M: "Mixta",
  A: "Se abstuvo",
  V: "Según el punto",
  S: "Sin votaciones",
};

export const ETIQUETA_SENTIDO: Record<Sentido, string> = {
  F: "A favor",
  C: "En contra",
  A: "Abstención",
  V: "Dividido",
  X: "No votó",
};

export type Prueba = { iniciativa: Iniciativa; direccion: 1 | -1; sentido: Sentido; nota?: string };
export type PosturaPartido = {
  postura: Postura;
  aFavor: number;
  enContra: number;
  abstencion: number;
  otras: number; // divididos, según el punto o no votó
  pruebas: Prueba[]; // más reciente primero
};
export type FilaPostura = { enunciado: Enunciado; porPartido: Record<string, PosturaPartido> };

export function sentido(posicion: PosicionIniciativa, direccion: 1 | -1): Sentido {
  switch (posicion) {
    case "S":
      return direccion > 0 ? "F" : "C";
    case "N":
      return direccion > 0 ? "C" : "F";
    case "A":
      return "A";
    case "D":
    case "V":
      return "V";
    default:
      return "X";
  }
}

// «V» cuando solo hay votos divididos o según el punto; «S» cuando no hay nada.
export function postura(p: Pick<PosturaPartido, "aFavor" | "enContra" | "abstencion"> & { otras?: number }): Postura {
  if (p.aFavor > 0 && p.enContra > 0) return "M";
  if (p.aFavor > 0) return "F";
  if (p.enContra > 0) return "C";
  if (p.abstencion > 0) return "A";
  if ((p.otras ?? 0) > 0) return "V";
  return "S";
}

const CARPETA = () => join(process.cwd(), "src", "datos", "posturas");
const CURADO = /^([a-z0-9-]+)\.json$/; // deja fuera <tema>.propuesto.json

let ficheros: Map<string, FicheroPosturas> | undefined;
const filas = new Map<string, FilaPostura[]>();

function cargarFicheros(): Map<string, FicheroPosturas> {
  const m = new Map<string, FicheroPosturas>();
  if (!existsSync(CARPETA())) return m;
  for (const f of readdirSync(CARPETA()).sort()) {
    const slug = CURADO.exec(f)?.[1];
    if (slug) m.set(slug, JSON.parse(readFileSync(join(CARPETA(), f), "utf8")) as FicheroPosturas);
  }
  return m;
}

const leidos = () => (ficheros ??= cargarFicheros());

// Slugs de los temas que tienen fichero de posturas curado.
export const temasConPosturas = (): string[] => [...leidos().keys()];

// El fichero curado de un tema, tal cual (para tests y para revisar asignaciones).
export const ficheroPosturas = (slug: string): FicheroPosturas | undefined => leidos().get(slug);

function calcular(slug: string): FilaPostura[] {
  const fichero = leidos().get(slug);
  if (!fichero) return [];
  const porId = new Map(iniciativasDeTema(slug).map((i) => [i.id, i]));
  const perdidas = fichero.asignaciones.filter((a) => !porId.has(a.iniciativa)).map((a) => a.iniciativa);
  if (perdidas.length) console.warn(`posturas/${slug}.json: iniciativas que no están en el tema: ${perdidas.join(", ")}`);

  const codigos = partidos()
    .map((p) => p.codigo)
    .sort((a, b) => a.localeCompare(b, "es"));

  return fichero.enunciados.map((enunciado) => {
    const asignadas = fichero.asignaciones
      .filter((a) => a.enunciado === enunciado.slug && porId.has(a.iniciativa))
      .map((a) => ({ a, i: porId.get(a.iniciativa)! }))
      .sort((x, y) => y.i.fecha.localeCompare(x.i.fecha));
    const porPartido: Record<string, PosturaPartido> = {};
    for (const codigo of codigos) {
      const pruebas: Prueba[] = asignadas.map(({ a, i }) => ({
        iniciativa: i,
        direccion: a.direccion,
        sentido: sentido(i.posiciones[codigo] ?? "X", a.direccion),
        ...(a.nota ? { nota: a.nota } : {}),
      }));
      const n = (s: Sentido) => pruebas.filter((p) => p.sentido === s).length;
      const cuenta = { aFavor: n("F"), enContra: n("C"), abstencion: n("A") };
      porPartido[codigo] = {
        // Para la postura solo cuentan los «V»: un grupo que no votó nunca sigue siendo «S».
        postura: postura({ ...cuenta, otras: n("V") }),
        ...cuenta,
        otras: pruebas.length - cuenta.aFavor - cuenta.enContra - cuenta.abstencion,
        pruebas,
      };
    }
    return { enunciado, porPartido };
  });
}

// Una fila por enunciado, en el orden del fichero; [] si el tema no tiene fichero de posturas.
export function posturasDeTema(slug: string): FilaPostura[] {
  if (!filas.has(slug)) filas.set(slug, calcular(slug));
  return filas.get(slug)!;
}
