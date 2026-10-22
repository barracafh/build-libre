import { cn } from "@/lib/utils";
import type { Posicion } from "@/lib/datos";

// A vote is a shape, a label and a tone (DESIGN.md · Vote tones and marks); "0" is no data.
export type Marca = Posicion | "0";

export const ETIQUETA: Record<Marca, string> = {
  S: "Sí",
  N: "No",
  A: "Abstención",
  X: "No vota",
  D: "Dividido",
  0: "Sin datos",
};

const FORMA: Record<Marca, string> = {
  S: "rounded-full bg-(--vote-yes)",
  N: "bg-(--vote-no)",
  A: "rounded-full border-[3px] border-(--vote-abst)",
  X: "m-[1.5px] size-[9px]! rounded-full border-[1.5px] border-(--vote-none)",
  D: "rounded-full border-[1.5px] border-(--vote-abst) bg-[linear-gradient(90deg,var(--vote-abst)_50%,transparent_50%)]",
  0: "rounded-full border-[1.5px] border-dashed border-(--vote-none)",
};

// The shape alone; put the label next to it, or use <Voto>.
export function VoteMark({ voto, className }: { voto: Marca; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("inline-block size-3 shrink-0 [forced-color-adjust:none]", FORMA[voto], className)}
    />
  );
}

export function Voto({ voto, className }: { voto: Marca; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap", className)}>
      <VoteMark voto={voto} />
      {ETIQUETA[voto]}
    </span>
  );
}
