import type { Iniciativa, Partido, Votacion } from "@/lib/datos";
import type { Marca } from "@/components/vote-mark";

// The official `tipo`, gathered into the groups the party sheet counts by.
export const TIPOS: [string, (tipo: string) => boolean][] = [
  ["Leyes", (t) => ["Proyecto de ley", "Toma en consideración", "Enmiendas del Senado", "Dictamen"].includes(t)],
  ["Decretos ley del Gobierno", (t) => t === "Convalidación RDL"],
  ["Mociones", (t) => t === "Moción"],
  ["Proposiciones no de ley", (t) => t === "Proposición no de ley"],
  ["Otras", () => true],
];

export const grupoTipo = (tipo: string) => TIPOS.find(([, es]) => es(tipo))![0];

export const nombreProponente = (codigo: string | null, partidos: Partido[]) =>
  codigo === "GOB"
    ? "Gobierno"
    : codigo === "MIXTO"
      ? "Grupo Mixto"
      : codigo
        ? (partidos.find((p) => p.codigo === codigo)?.nombre ?? codigo)
        : "Sin proponente";

// Titles are never cut by us: about half arrive shortened upstream with «…», so those show the
// first paragraph of the official text plus the vote's note, e.g. «(punto 2)» (DESIGN.md · Typography).
export function tituloCompleto(titulo: string, texto: string) {
  if (!titulo.includes("…") || !texto) return titulo;
  const nota = titulo.match(/…\s*(\([^)]*\))\s*$/)?.[1];
  const base = texto.split("\n")[0].trim();
  return nota ? `${base} ${nota}` : base;
}

export const marcaDe = (v: Votacion, codigo: string): Marca => v.partidos[codigo]?.posicion ?? "0";

// "118 sí, 1 no vota": how many deputies of the group cast each option.
export function conteoTexto(v: Votacion, codigo: string) {
  const c = v.partidos[codigo]?.conteo;
  if (!c) return "sin datos";
  const partes: [number, string][] = [
    [c.S, "sí"],
    [c.N, "no"],
    [c.A, "abstención"],
    [c.X, "no vota"],
  ];
  return partes
    .filter(([n]) => n)
    .map(([n, l]) => `${n} ${l}`)
    .join(", ");
}

// UTC so the server and the browser print the same day.
const formato = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
export const fecha = (iso: string) => formato.format(new Date(`${iso}T00:00:00Z`));

// An element id for an initiative: claves like "121/000009" have slashes.
export const idIniciativa = (i: Pick<Iniciativa, "clave">) => `ini-${i.clave.replace(/[^\w-]/g, "-")}`;

export type Filtro = { codigo: string; campo: "tipo" | "proponente"; valor: string; voto: Marca; texto: string };

export const cumpleFiltro = (f: Filtro | null, i: Iniciativa, v: Votacion) =>
  !f ||
  (marcaDe(v, f.codigo) === f.voto &&
    (f.campo === "tipo" ? grupoTipo(i.tipo) === f.valor : (i.proponente ?? "") === f.valor));
