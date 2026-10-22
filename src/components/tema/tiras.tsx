import type { ReactNode } from "react";

import { nombreCorto } from "@/components/partido";
import { ScrollTable } from "@/components/scroll-table";
import { ETIQUETA, type Marca } from "@/components/vote-mark";
import type { Iniciativa, Partido } from "@/lib/datos";
import { fecha, marcaDe, tituloCompleto } from "./comun";

const ETIQUETAS = 132; // width of the party labels
const PASO = 11; // one vote
const FILA = 28; // a row with one lane of marks
const EJE = 26;
const PX_DIA = 1.2; // horizontal scale: pixels per day
const TRAMO_MIN = 640; // narrowest time axis
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

const dia = (iso: string) => Date.parse(`${iso}T00:00:00Z`) / 86_400_000;
const primeroDeMes = (anio: number, mes: number) => Date.UTC(anio, mes, 1) / 86_400_000;

// The same shapes as <VoteMark>, drawn in SVG; tones from the vote tokens.
function forma(m: Marca, x: number, y: number): ReactNode {
  switch (m) {
    case "S":
      return <circle cx={x} cy={y} r={4.5} fill="var(--vote-yes)" />;
    case "N":
      return <rect x={x - 4.5} y={y - 4.5} width={9} height={9} fill="var(--vote-no)" />;
    case "A":
      return <circle cx={x} cy={y} r={3.6} fill="none" stroke="var(--vote-abst)" strokeWidth={2} />;
    case "X":
      return <circle cx={x} cy={y} r={3} fill="none" stroke="var(--vote-none)" strokeWidth={1.2} />;
    case "D":
      return (
        <>
          <circle cx={x} cy={y} r={4} fill="var(--background)" stroke="var(--vote-abst)" strokeWidth={1} />
          <path d={`M${x} ${y - 4} A4 4 0 0 0 ${x} ${y + 4} Z`} fill="var(--vote-abst)" />
        </>
      );
    default:
      return (
        <circle cx={x} cy={y} r={4} fill="none" stroke="var(--vote-none)" strokeWidth={1} strokeDasharray="2 2" />
      );
  }
}

// One row per party with the votes on the initiatives that party proposed, on a time scale: a
// mark sits at the day of its vote. Marks of the same day stack in lanes inside the row.
export function Tiras({
  iniciativas,
  partidos,
  abrir,
}: {
  iniciativas: Iniciativa[];
  partidos: Partido[];
  abrir: (clave: string) => void;
}) {
  const codigos = new Set(partidos.map((p) => p.codigo));
  const votos = iniciativas
    .flatMap((i) => i.votaciones.map((v) => ({ i, v })))
    .sort((a, b) => a.v.fecha.localeCompare(b.v.fecha) || a.v.id.localeCompare(b.v.id, "es", { numeric: true }));
  const propios = votos.filter(({ i }) => i.proponente && codigos.has(i.proponente));
  const ajenos = votos.length - propios.length;
  if (propios.length === 0) {
    return <p className="max-w-[72ch] text-sm text-muted-foreground">Ningún grupo propone iniciativas de este tema.</p>;
  }

  // The axis runs from the first day of the first month to the first day after the last one.
  const primera = new Date(`${propios[0].v.fecha}T00:00:00Z`);
  const ultima = new Date(`${propios.at(-1)!.v.fecha}T00:00:00Z`);
  const mes0 = primera.getUTCFullYear() * 12 + primera.getUTCMonth();
  const mes1 = ultima.getUTCFullYear() * 12 + ultima.getUTCMonth() + 1;
  const d0 = primeroDeMes(Math.floor(mes0 / 12), mes0 % 12);
  const d1 = primeroDeMes(Math.floor(mes1 / 12), mes1 % 12);
  const escala = Math.max(PX_DIA, TRAMO_MIN / (d1 - d0));
  const xDe = (d: number) => ETIQUETAS + (d - d0) * escala;
  const ancho = Math.ceil(xDe(d1)) + 8;

  // Quarter lines: the year at each January (and at the first line), the month name at the others.
  const cortes = Array.from({ length: mes1 - mes0 + 1 }, (_, k) => mes0 + k)
    .filter((m) => m % 12 % 3 === 0)
    .map((m, k) => {
      const anio = Math.floor(m / 12);
      const mes = m % 12;
      const etiqueta = mes === 0 ? `${anio}` : k === 0 ? `${MESES[mes]} ${anio}` : MESES[mes];
      return { m, x: xDe(primeroDeMes(anio, mes)), etiqueta, anio: mes === 0 };
    });

  // Lanes: a mark goes in the first lane whose last mark ends before it.
  let top = EJE;
  const filas = partidos.map((p) => {
    const finales: number[] = [];
    const marcas = propios
      .filter(({ i }) => i.proponente === p.codigo)
      .map(({ i, v }) => {
        const x = xDe(dia(v.fecha)) + PASO / 2;
        let carril = finales.findIndex((f) => f + PASO <= x);
        if (carril < 0) carril = finales.length;
        finales[carril] = x;
        return { i, v, x, carril };
      });
    const alto = Math.max(FILA, finales.length * PASO + 8);
    const fila = { p, marcas, alto, y: top, base: top + (alto - Math.max(finales.length, 1) * PASO) / 2 };
    top += alto;
    return fila;
  });
  const alto = top + 4;

  return (
    <>
      <ScrollTable label="Gráfico de las votaciones de las iniciativas de cada grupo">
        <svg
          width={ancho}
          height={alto}
          viewBox={`0 0 ${ancho} ${alto}`}
          role="img"
          aria-label="Voto de cada grupo en las votaciones de las iniciativas que propuso, a escala de tiempo. La tabla de abajo tiene los mismos datos."
          className="block"
        >
          {cortes.map(({ m, x, etiqueta, anio }) => (
            <g key={m}>
              <line x1={x} x2={x} y1={EJE - 14} y2={alto} stroke="var(--border)" strokeWidth={anio ? 1.5 : 1} />
              <text x={x + 3} y={EJE - 6} fontSize={11} fill="var(--muted-foreground)" className="font-mono">
                {etiqueta}
              </text>
            </g>
          ))}
          {filas.map(({ p, marcas, alto: h, y, base }) => (
            <g key={p.codigo}>
              <line x1={0} x2={ancho} y1={y} y2={y} stroke="var(--border)" />
              <rect x={0} y={y + h / 2 - 5} width={10} height={10} rx={2} fill={p.color} stroke="var(--foreground)" />
              <text x={16} y={y + h / 2 + 4} fontSize={12} fill="var(--foreground)">
                {nombreCorto(p.nombre)}
              </text>
              {marcas.length === 0 && (
                <text x={ETIQUETAS + 6} y={y + h / 2 + 4} fontSize={12} fill="var(--muted-foreground)">
                  Sin iniciativas propias en este tema
                </text>
              )}
              {marcas.map(({ i, v, x, carril }) => {
                const m = marcaDe(v, p.codigo);
                const cy = base + carril * PASO + PASO / 2;
                // Mouse shortcut only: the keyboard opens the same initiative from its row in the table.
                return (
                  <g key={v.id} onClick={() => abrir(i.clave)} className="cursor-pointer">
                    <title>{`${p.nombre}: ${ETIQUETA[m]}\n${fecha(v.fecha)} · ${tituloCompleto(v.titulo, v.texto)}`}</title>
                    <rect x={x - PASO / 2} y={cy - PASO / 2} width={PASO} height={PASO} fill="transparent" />
                    {forma(m, x, cy)}
                  </g>
                );
              })}
            </g>
          ))}
        </svg>
      </ScrollTable>
      {ajenos > 0 && (
        <p className="max-w-[72ch] text-sm text-muted-foreground">
          No se dibujan {ajenos} votaciones de iniciativas del Gobierno, del Grupo Mixto o sin proponente.
        </p>
      )}
    </>
  );
}
