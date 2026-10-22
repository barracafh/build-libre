import type { ReactNode } from "react";

import { nombreCorto } from "@/components/partido";
import { ScrollTable } from "@/components/scroll-table";
import { ETIQUETA, type Marca } from "@/components/vote-mark";
import type { Iniciativa, Partido } from "@/lib/datos";
import { fecha, marcaDe, nombreProponente, tituloCompleto } from "./comun";

const ETIQUETAS = 132; // width of the party labels
const PASO = 11; // one vote
const FILA = 28;
const EJE = 26;

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

// One row per party, one mark per main vote in date order (order, not a time scale).
export function Tiras({
  iniciativas,
  partidos,
  abrir,
}: {
  iniciativas: Iniciativa[];
  partidos: Partido[];
  abrir: (clave: string) => void;
}) {
  const votos = iniciativas
    .flatMap((i) => i.votaciones.map((v) => ({ i, v })))
    .sort((a, b) => a.v.fecha.localeCompare(b.v.fecha) || a.v.id.localeCompare(b.v.id, "es", { numeric: true }));
  const ancho = ETIQUETAS + votos.length * PASO + 8;
  const alto = EJE + partidos.length * FILA + 4;
  const anios = votos.flatMap(({ v }, k) => (k === 0 || votos[k - 1].v.fecha.slice(0, 4) !== v.fecha.slice(0, 4) ? [[k, v.fecha.slice(0, 4)] as const] : []));

  return (
    <ScrollTable label="Gráfico de todas las votaciones del tema">
      <svg
        width={ancho}
        height={alto}
        viewBox={`0 0 ${ancho} ${alto}`}
        role="img"
        aria-label="Voto de cada grupo en cada votación del tema, en orden de fecha. La tabla de arriba tiene los mismos datos."
        className="block"
      >
        {anios.map(([k, a]) => {
          const x = ETIQUETAS + k * PASO - 1;
          return (
            <g key={a}>
              <line x1={x} x2={x} y1={EJE - 14} y2={alto} stroke="var(--border)" />
              <text x={x + 3} y={EJE - 6} fontSize={11} fill="var(--muted-foreground)" className="font-mono">
                {a}
              </text>
            </g>
          );
        })}
        {partidos.map((p, r) => {
          const y = EJE + r * FILA + FILA / 2;
          return (
            <g key={p.codigo}>
              <line x1={0} x2={ancho} y1={EJE + r * FILA} y2={EJE + r * FILA} stroke="var(--border)" />
              <rect x={0} y={y - 5} width={10} height={10} rx={2} fill={p.color} stroke="var(--foreground)" />
              <text x={16} y={y + 4} fontSize={12} fill="var(--foreground)">
                {nombreCorto(p.nombre)}
              </text>
              {votos.map(({ i, v }, k) => {
                const m = marcaDe(v, p.codigo);
                const x = ETIQUETAS + k * PASO + PASO / 2 - 1;
                // Mouse shortcut only: the keyboard opens the same initiative from its row in the table.
                return (
                  <g key={v.id} onClick={() => abrir(i.clave)} className="cursor-pointer">
                    <title>{`${p.nombre}: ${ETIQUETA[m]}\n${fecha(v.fecha)} · ${tituloCompleto(v.titulo, v.texto)}\nPropone ${nombreProponente(i.proponente, partidos)}`}</title>
                    <rect x={x - PASO / 2} y={EJE + r * FILA} width={PASO} height={FILA} fill="transparent" />
                    {forma(m, x, y)}
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
    </ScrollTable>
  );
}
