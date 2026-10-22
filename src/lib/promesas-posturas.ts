// Qué prometió cada partido en su programa de 2023 sobre las medidas del mapa de posturas, y si sus
// votos coinciden con lo prometido.
//
// Solo servidor: lee src/datos/promesas-posturas/<tema>.json en el build.
//
// - Cada promesa del tema se asigna a mano a un enunciado de src/datos/posturas/<tema>.json (o a
//   ninguno) con su postura sobre la medida tal como está redactada: F a favor, C en contra.
// - Sin IA: el cumplimiento sale de comparar esa postura con la postura de voto.
// - Asignaciones con una promesa que ya no está en el tema se ignoran con un aviso.

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { promesasDeTema, type Promesa } from "./promesas.ts";
import type { FilaPostura, Postura } from "./posturas.ts";

export type PosturaPromesa = "F" | "C";
export type PromesaAsignada = { promesa: Promesa; enunciado: string; postura: PosturaPromesa; nota?: string; revisar?: boolean };
export type Cumplimiento = "coincide" | "difiere" | "sin-votacion" | "sin-promesa" | "sin-datos";

export type AsignacionPromesa = { promesa: string; enunciado: string; postura: PosturaPromesa; nota?: string; revisar?: boolean };
export type FicheroPromesasPosturas = {
  tema: string;
  asignaciones: AsignacionPromesa[];
  sinEnunciado?: { promesa: string; nota: string }[];
};

export const ETIQUETA_CUMPLIMIENTO: Record<Cumplimiento, string> = {
  coincide: "Vota como prometió",
  difiere: "Vota distinto de lo que prometió",
  "sin-votacion": "Prometió, sin votación clara",
  "sin-promesa": "Sin promesa en su programa",
  "sin-datos": "Programa no analizado",
};

const porCodigo = (a: string, b: string) => a.localeCompare(b, "es");

/** Códigos de partido con promesas analizadas para el tema; el resto queda «sin-datos». */
export const PARTIDOS_CON_PROGRAMA = (tema: string): string[] => Object.keys(promesasDeTema(tema)).sort(porCodigo);

const CARPETA = () => join(process.cwd(), "src", "datos", "promesas-posturas");
const ficheros = new Map<string, FicheroPromesasPosturas | null>();

/** El fichero curado de un tema, tal cual, o undefined si no hay. */
export function ficheroPromesasPosturas(tema: string): FicheroPromesasPosturas | undefined {
  if (!ficheros.has(tema)) {
    const ruta = join(CARPETA(), `${tema}.json`);
    ficheros.set(tema, existsSync(ruta) ? (JSON.parse(readFileSync(ruta, "utf8")) as FicheroPromesasPosturas) : null);
  }
  return ficheros.get(tema) ?? undefined;
}

const indices = new Map<string, Record<string, Record<string, PromesaAsignada[]>>>();

/** Enunciado → código de partido (alfabético) → promesas asignadas; {} si el tema no tiene fichero. */
export function promesasPorEnunciado(tema: string): Record<string, Record<string, PromesaAsignada[]>> {
  const hecho = indices.get(tema);
  if (hecho) return hecho;
  const fichero = ficheroPromesasPosturas(tema);
  const out: Record<string, Record<string, PromesaAsignada[]>> = {};
  if (fichero) {
    const porId = new Map<string, [string, Promesa]>();
    for (const [codigo, lista] of Object.entries(promesasDeTema(tema))) for (const p of lista) porId.set(p.id, [codigo, p]);
    const perdidas = fichero.asignaciones.filter((a) => !porId.has(a.promesa)).map((a) => a.promesa);
    if (perdidas.length) console.warn(`promesas-posturas/${tema}.json: promesas que no están en el tema: ${perdidas.join(", ")}`);
    const tmp: Record<string, Record<string, PromesaAsignada[]>> = {};
    for (const a of fichero.asignaciones) {
      const hit = porId.get(a.promesa);
      if (!hit) continue;
      const [codigo, promesa] = hit;
      ((tmp[a.enunciado] ??= {})[codigo] ??= []).push({
        promesa,
        enunciado: a.enunciado,
        postura: a.postura,
        ...(a.nota ? { nota: a.nota } : {}),
        ...(a.revisar ? { revisar: true } : {}),
      });
    }
    for (const [enunciado, porPartido] of Object.entries(tmp))
      out[enunciado] = Object.fromEntries(Object.keys(porPartido).sort(porCodigo).map((c) => [c, porPartido[c]]));
  }
  indices.set(tema, out);
  return out;
}

/**
 * Compara la postura de voto con lo prometido. La postura de las promesas es la de la mayoría;
 * un empate entre F y C cuenta como «sin-votacion» (no hay una promesa clara con la que comparar).
 */
export function cumplimiento(posturaVoto: Postura, promesas: PromesaAsignada[], tienePrograma: boolean): Cumplimiento {
  if (!tienePrograma) return "sin-datos";
  if (promesas.length === 0) return "sin-promesa";
  const f = promesas.filter((p) => p.postura === "F").length;
  const c = promesas.length - f;
  if (f === c) return "sin-votacion";
  const prometida: PosturaPromesa = f > c ? "F" : "C";
  if (posturaVoto !== "F" && posturaVoto !== "C") return "sin-votacion";
  return posturaVoto === prometida ? "coincide" : "difiere";
}

/** Código de partido (alfabético) → cumplimiento y promesas para una fila del mapa de posturas. */
export function cumplimientoPorFila(
  fila: FilaPostura,
  tema: string,
): Record<string, { cumplimiento: Cumplimiento; promesas: PromesaAsignada[] }> {
  const conPrograma = new Set(PARTIDOS_CON_PROGRAMA(tema));
  const delEnunciado = promesasPorEnunciado(tema)[fila.enunciado.slug] ?? {};
  const out: Record<string, { cumplimiento: Cumplimiento; promesas: PromesaAsignada[] }> = {};
  for (const codigo of Object.keys(fila.porPartido).sort(porCodigo)) {
    const promesas = delEnunciado[codigo] ?? [];
    out[codigo] = { cumplimiento: cumplimiento(fila.porPartido[codigo].postura, promesas, conPrograma.has(codigo)), promesas };
  }
  return out;
}
