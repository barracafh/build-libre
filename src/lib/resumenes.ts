// Resumen automático de un tema: 3–4 frases sobre qué se votó y qué grupos votaron a favor y en contra.
//
// Solo servidor: lee src/datos/resumenes/<tema>.json, que genera una vez scripts/resumenes.ts con IA.
//
// - Sin IA en la web: aquí solo se lee el fichero ya generado y validado.
// - Una frase por iniciativa: el modelo solo redacta QUÉ se votó y si salió adelante. Fecha, grupos y
//   votos los pinta el componente desde los datos, así que el modelo no puede equivocarse en hechos.
// - problemasFrase(): lo que hace descartar una frase (grupos, años, meses, recuentos, resultado
//   contrario al de los datos o palabras vetadas). La usan el script y los tests.
// - PALABRAS_VETADAS: valoraciones que una frase no puede llevar; el script descarta las que las usan.
//   Cada entrada es un prefijo («incumpl» veta «incumple»), salvo las que acaban en «$», que son
//   palabras enteras («mejor$» veta «mejor» pero no «mejorar», que sale en títulos oficiales).

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { partidos } from "./datos.ts";

export type FraseResumen = { texto: string; iniciativas: string[] };
export type ResumenTema = { tema: string; generado: string; modelo: string; frases: FraseResumen[] };

export const PALABRAS_VETADAS = [
  "coherente",
  "incoherente",
  "coherencia",
  "incumpl",
  "cumpl",
  "rebelde",
  "leal$",
  "lealtad",
  "traicion",
  "mejor$",
  "peor$",
  "siempre$",
  "nunca$",
  "firmemente",
  "rotundamente",
  "contradic",
  "polemic",
  "radical",
  "extrem",
  "acertad",
  "fracas",
  "exito",
  "abusiv",
  "importante$",
  "historic",
  "claramente",
];

const sinTildes = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();

// Las palabras vetadas que aparecen en el texto (al principio de una palabra, sin tildes).
export function palabrasVetadas(texto: string): string[] {
  const t = sinTildes(texto);
  return PALABRAS_VETADAS.filter((p) =>
    new RegExp(`(^|[^\\p{L}])${p.endsWith("$") ? `${p.slice(0, -1)}(?![\\p{L}])` : p}`, "u").test(t),
  ).map((p) => p.replace(/\$$/, ""));
}

const MESES = /(^|[^\p{L}])(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre)(?![\p{L}])/u;
const ANIO = /(^|\D)(19|20)\d\d(?!\d)/;
const RECUENTO = /\d[\d.]*\s+votos/;
// Además de nombres y códigos de partidos(): formas con que los títulos oficiales nombran a los grupos.
const OTROS_GRUPOS = ["grupo parlamentario", "grupo mixto", "socialista", "republicano", "podemos", "eaj", "pnv"];

const escapar = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Nombres de grupo que aparecen en el texto. «Gobierno» está permitido.
export function gruposEnTexto(texto: string): string[] {
  const t = sinTildes(texto);
  const terminos = [
    ...partidos().flatMap((p) => [p.nombre, p.codigo]),
    ...OTROS_GRUPOS,
  ].map(sinTildes);
  return [...new Set(terminos)].filter((x) =>
    new RegExp(`(^|[^\\p{L}])${escapar(x)}(?![\\p{L}])`, "u").test(t),
  );
}

// «salió adelante» / «no salió adelante» según la frase; null si no dice ninguna de las dos.
export function resultadoEnTexto(texto: string): boolean | null {
  const t = texto.toLowerCase();
  if (t.includes("no salió adelante")) return false;
  if (t.includes("salió adelante")) return true;
  return null;
}

// Motivos para descartar una frase; [] si vale. `salio`: totales.si > totales.no en la primera votación.
export function problemasFrase(texto: string, salio: boolean): string[] {
  const p: string[] = [];
  const grupos = gruposEnTexto(texto);
  if (grupos.length) p.push(`nombra grupos (${grupos.join(", ")})`);
  if (ANIO.test(texto)) p.push("lleva un año");
  if (MESES.test(sinTildes(texto))) p.push("lleva un mes");
  if (RECUENTO.test(texto)) p.push("lleva un recuento de votos");
  const r = resultadoEnTexto(texto);
  if (r === null) p.push("no dice «salió adelante» ni «no salió adelante»");
  else if (r !== salio) p.push(`dice «${r ? "salió adelante" : "no salió adelante"}» y los datos dicen lo contrario`);
  const vetadas = palabrasVetadas(texto);
  if (vetadas.length) p.push(`palabras vetadas (${vetadas.join(", ")})`);
  return p;
}

const CARPETA = () => join(process.cwd(), "src", "datos", "resumenes");
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const cache = new Map<string, ResumenTema | undefined>();

export function resumenDeTema(slug: string): ResumenTema | undefined {
  if (cache.has(slug)) return cache.get(slug);
  let r: ResumenTema | undefined;
  const fichero = join(CARPETA(), `${slug}.json`);
  if (SLUG.test(slug) && existsSync(fichero)) {
    const d = JSON.parse(readFileSync(fichero, "utf8")) as ResumenTema;
    if (d.frases?.length) r = { tema: d.tema, generado: d.generado, modelo: d.modelo, frases: d.frases };
  }
  cache.set(slug, r);
  return r;
}
