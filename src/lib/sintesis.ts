import { completar } from "./ia.ts";
import type { RazonCruce } from "./cruce.ts";

export const MAX_SINTESIS = 400;

const cache = new Map<string, Promise<string | null>>();

// Resume en un máximo de 400 caracteres las razones que dio un grupo en las
// votaciones de un tema. Devuelve null si no hay razones o el modelo no responde.
export function sintetizar(
  grupo: string,
  tema: string,
  razones: RazonCruce[],
): Promise<string | null> {
  if (!razones.length) return Promise.resolve(null);
  const clave = `${grupo}|${tema}|${razones.length}|${razones.at(-1)?.fecha}`;
  let pendiente = cache.get(clave);
  if (!pendiente) {
    pendiente = generar(grupo, tema, razones).catch(() => {
      cache.delete(clave);
      return null;
    });
    cache.set(clave, pendiente);
  }
  return pendiente;
}

async function generar(grupo: string, tema: string, razones: RazonCruce[]) {
  const texto = await completar([
    {
      role: "system",
      content:
        `Sintetizas en castellano llano, en un solo párrafo de como máximo ${MAX_SINTESIS} caracteres, ` +
        "las razones que dio un grupo parlamentario para votar en las votaciones de un tema. " +
        "Usa solo lo que dicen las razones: no añadas hechos, no valores, no compares con otros grupos " +
        "y no recomiendes nada. Escribe en tercera persona y sin comillas ni listas.",
    },
    {
      role: "user",
      content:
        `Grupo: ${grupo}\nTema: ${tema}\nRazones:\n` +
        razones.map((r) => `- ${r.texto}`).join("\n"),
    },
  ]);
  const limpio = texto.trim().replace(/\s+/g, " ");
  if (limpio.length <= MAX_SINTESIS) return limpio;
  // Si el modelo se pasa, corta en la última frase completa que quepa.
  const corte = limpio.slice(0, MAX_SINTESIS);
  const fin = corte.lastIndexOf(". ");
  return fin > 0 ? corte.slice(0, fin + 1) : `${corte.slice(0, MAX_SINTESIS - 1)}…`;
}
