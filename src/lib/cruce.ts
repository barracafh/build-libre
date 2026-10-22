import { readFile } from "node:fs/promises";
import path from "node:path";

export type Sentido = "S" | "N" | "A" | "D" | "?";

export type VotoCruce = {
  id: string;
  fecha: string;
  titulo: string;
  sentido: Sentido;
  url: string;
};

export type RazonCruce = { texto: string; orador: string; fecha: string };

export type IntervencionCruce = {
  orador: string;
  cita: string;
  fecha: string;
  sesion: string;
};

type Votacion = {
  id: string;
  fecha: string;
  titulo: string;
  grupos: Record<string, Sentido>;
  json: string;
  tm?: string[];
  porque?: Record<string, [string, string, string, string]>;
};
type Sesion = {
  id: string;
  fecha: string;
  puntos: { itemId: string; votos: string[] }[];
};
type Intervencion = {
  s: string;
  item: number;
  orador: string;
  g: string;
  cita?: string;
};

const DATA = path.join(process.cwd(), "data");

async function leer<T>(carpeta: string, mes: string): Promise<T[]> {
  try {
    return JSON.parse(
      await readFile(path.join(DATA, carpeta, `${mes}.json`), "utf8"),
    );
  } catch {
    return [];
  }
}

const meses = async (): Promise<string[]> => {
  const { readdir } = await import("node:fs/promises");
  return (await readdir(path.join(DATA, "votaciones")))
    .filter((f) => /^\d{4}-\d{2}\.json$/.test(f))
    .map((f) => f.slice(0, 7))
    .sort();
};

// Votaciones de un grupo sobre un tema y las intervenciones de ese grupo en los
// puntos votados (misma sesión y mismo punto del orden del día).
export async function cruzar(partido: string, tema: string) {
  const votos: VotoCruce[] = [];
  const intervenciones: IntervencionCruce[] = [];
  const razones: RazonCruce[] = [];
  const vistas = new Set<string>();

  for (const mes of await meses()) {
    const votaciones = (await leer<Votacion>("votaciones", mes)).filter(
      (v) => v.tm?.includes(tema) && v.grupos[partido],
    );
    if (!votaciones.length) continue;

    const [sesiones, items, todas] = await Promise.all([
      leer<Sesion>("sesiones", mes),
      leer<string>("items", mes),
      leer<Intervencion>("intervenciones", mes),
    ]);

    for (const v of votaciones) {
      votos.push({
        id: v.id,
        fecha: v.fecha,
        titulo: v.titulo,
        sentido: v.grupos[partido],
        url: v.json,
      });

      // Una misma razón se repite en las votaciones de un mismo debate.
      const porque = v.porque?.[partido];
      if (porque && !vistas.has(porque[0])) {
        vistas.add(porque[0]);
        razones.push({ texto: porque[0], orador: porque[1], fecha: porque[3] });
      }

      const sesion = sesiones.find((s) =>
        s.puntos.some((p) => p.votos.includes(v.id)),
      );
      const punto = sesion?.puntos.find((p) => p.votos.includes(v.id));
      const item = punto ? items.indexOf(punto.itemId) : -1;
      if (!sesion || item < 0) continue;

      for (const i of todas) {
        if (i.s !== sesion.id || i.item !== item || i.g !== partido) continue;
        if (!i.cita || vistas.has(i.cita)) continue;
        vistas.add(i.cita);
        intervenciones.push({
          orador: i.orador,
          cita: i.cita,
          fecha: sesion.fecha,
          sesion: sesion.id,
        });
      }
    }
  }

  const porFecha = <T extends { fecha: string }>(a: T, b: T) =>
    a.fecha.localeCompare(b.fecha);
  return {
    votos: votos.sort(porFecha),
    intervenciones: intervenciones.sort(porFecha),
    razones: razones.sort(porFecha),
  };
}

export type Recuento = Record<Sentido, number>;

// Cuántas veces votó cada grupo en cada sentido, por tema: tema → grupo → recuento.
export async function recuentos() {
  const tabla: Record<string, Record<string, Recuento>> = {};
  for (const mes of await meses()) {
    for (const v of await leer<Votacion>("votaciones", mes)) {
      for (const tema of v.tm ?? []) {
        for (const [grupo, sentido] of Object.entries(v.grupos)) {
          const celda = ((tabla[tema] ??= {})[grupo] ??= {
            S: 0,
            N: 0,
            A: 0,
            D: 0,
            "?": 0,
          });
          celda[sentido]++;
        }
      }
    }
  }
  return tabla;
}
