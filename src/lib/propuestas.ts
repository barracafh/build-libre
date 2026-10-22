// Qué propone cada grupo en cada tema, según sus intervenciones en el Pleno.
//
// Solo servidor: lee data/normalizacion/propuestas.json en el build.
//
// - Las líneas las resume un modelo de lenguaje a partir del Diario de Sesiones: se muestran con
//   PROPUESTAS_AVISO y con sus citas, que enlazan el Diario de la sesión cuando se conoce.
// - Solo los grupos de partidos(): fuera el Gobierno, el Grupo Mixto y la Mesa.

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { partidos } from "./datos.ts";

export type Cita = { texto: string; orador: string; sesion: string; fecha: string; diario: string | null };
export type Linea = { titulo: string; n: number; citas: Cita[] };

export const PROPUESTAS_AVISO =
  "Líneas resumidas automáticamente a partir del Diario de Sesiones; cada cita enlaza la sesión original.";

// Forma de origen, solo los campos que se usan. Ejemplo: [texto, orador, id sesión, fecha].
type PropuestaOrigen = {
  grupo: string;
  tema: string;
  lineas: { titulo: string; n: number; ejemplos: [string, string, string, string][] }[];
};

const leer = (...ruta: string[]) => JSON.parse(readFileSync(join(process.cwd(), ...ruta), "utf8"));

let cache: ReturnType<typeof cargar> | undefined;

function cargar() {
  // Solo los ficheros mensuales de sesiones; los de una sesión suelta son otro formato.
  const diarios = new Map<string, string | null>();
  for (const f of readdirSync(join(process.cwd(), "data", "sesiones")).sort()) {
    if (!/^\d{4}-\d{2}\.json$/.test(f)) continue;
    for (const s of leer("data", "sesiones", f) as { id: string; ds: string | null }[]) diarios.set(s.id, s.ds);
  }

  const origen = leer("data", "normalizacion", "propuestas.json") as Record<string, PropuestaOrigen>;
  const porTema = new Map<string, Record<string, Linea[]>>();
  for (const tema of new Set(Object.values(origen).map((p) => p.tema))) {
    const grupos: Record<string, Linea[]> = {};
    for (const { codigo } of partidos()) {
      const p = origen[`${tema}|${codigo}`];
      if (!p) continue;
      grupos[codigo] = p.lineas
        .map((l) => ({
          titulo: l.titulo,
          n: l.n,
          citas: l.ejemplos.map(([texto, orador, sesion, fecha]) => ({
            texto,
            orador,
            sesion,
            fecha,
            diario: diarios.get(sesion) ?? null,
          })),
        }))
        .sort((a, b) => b.n - a.n);
    }
    porTema.set(tema, grupos);
  }
  return porTema;
}

// Por grupo (en orden alfabético de nombre), sus líneas del tema de más a menos mencionada.
export const propuestasDeTema = (slug: string): Record<string, Linea[]> =>
  (cache ??= cargar()).get(slug) ?? {};
