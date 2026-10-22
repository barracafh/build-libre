// Resúmenes cortos de las posturas de un tema, derivados de posturas.ts (sin IA).
//
// - Una línea por medida: qué grupos quedan en cada postura.
// - Una línea por grupo: en qué medidas queda a favor, en contra, mixta, según el punto o se abstuvo.
// Misma plantilla para todos los grupos, orden alfabético, sin adjetivos.

import { partidos } from "./datos.ts";
import type { Enunciado, FilaPostura, Postura } from "./posturas.ts";

export type ResumenMedida = {
  enunciado: Enunciado;
  aFavor: string[];
  enContra: string[];
  mixta: string[];
  segunPunto: string[];
  abstuvo: string[];
  sinVoto: string[];
};

export type ResumenPartido = {
  aFavor: Enunciado[];
  enContra: Enunciado[];
  mixta: Enunciado[];
  segunPunto: Enunciado[];
  abstuvo: Enunciado[];
};

const CLAVE: Record<Postura, keyof Omit<ResumenMedida, "enunciado">> = {
  F: "aFavor",
  C: "enContra",
  M: "mixta",
  V: "segunPunto",
  A: "abstuvo",
  S: "sinVoto",
};

// Orden fijo de los grupos de la frase de una medida.
const ORDEN_MEDIDA: { clave: keyof Omit<ResumenMedida, "enunciado">; etiqueta: string }[] = [
  { clave: "aFavor", etiqueta: "A favor" },
  { clave: "enContra", etiqueta: "En contra" },
  { clave: "mixta", etiqueta: "Mixta" },
  { clave: "segunPunto", etiqueta: "Según el punto" },
  { clave: "abstuvo", etiqueta: "Se abstuvo" },
  { clave: "sinVoto", etiqueta: "Sin votaciones" },
];

/** «A», «A y B», «A, B y C». */
export function unirLista(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} y ${items[items.length - 1]}`;
}

const alfabetico = (a: string, b: string) => a.localeCompare(b, "es");

export function resumenMedida(fila: FilaPostura): ResumenMedida {
  const nombres = new Map(partidos().map((p) => [p.codigo, p.nombre]));
  const r: ResumenMedida = {
    enunciado: fila.enunciado,
    aFavor: [],
    enContra: [],
    mixta: [],
    segunPunto: [],
    abstuvo: [],
    sinVoto: [],
  };
  for (const [codigo, dato] of Object.entries(fila.porPartido)) {
    r[CLAVE[dato.postura]].push(nombres.get(codigo) ?? codigo);
  }
  for (const { clave } of ORDEN_MEDIDA) r[clave].sort(alfabetico);
  return r;
}

export function fraseMedida(fila: FilaPostura): string {
  const r = resumenMedida(fila);
  return ORDEN_MEDIDA.filter(({ clave }) => r[clave].length)
    .map(({ clave, etiqueta }) => `${etiqueta}: ${unirLista(r[clave])}`)
    .join(" · ");
}

export function resumenPartido(filas: FilaPostura[], codigo: string): ResumenPartido {
  const r: ResumenPartido = { aFavor: [], enContra: [], mixta: [], segunPunto: [], abstuvo: [] };
  for (const f of filas) {
    const clave = CLAVE[f.porPartido[codigo]?.postura ?? "S"];
    if (clave !== "sinVoto") r[clave].push(f.enunciado);
  }
  return r;
}

const minuscula = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

// Orden fijo de las partes de la frase de un grupo; cada medida lleva su preposición.
const ORDEN_PARTIDO: { clave: keyof ResumenPartido; inicio: string; prep: string }[] = [
  { clave: "aFavor", inicio: "a favor", prep: "de" },
  { clave: "enContra", inicio: "en contra", prep: "de" },
  { clave: "mixta", inicio: "mixta", prep: "en" },
  { clave: "segunPunto", inicio: "según el punto", prep: "en" },
  { clave: "abstuvo", inicio: "se abstuvo", prep: "en" },
];

export function frasePartido(filas: FilaPostura[], codigo: string): string | null {
  const r = resumenPartido(filas, codigo);
  const partes = ORDEN_PARTIDO.filter(({ clave }) => r[clave].length).map(
    ({ clave, inicio, prep }) =>
      `${inicio} ${unirLista(r[clave].map((e) => `${prep} ${minuscula(e.texto)}`))}`,
  );
  if (!partes.length) return null;
  const frase = partes.join("; ");
  return `${frase.charAt(0).toUpperCase()}${frase.slice(1)}.`;
}
