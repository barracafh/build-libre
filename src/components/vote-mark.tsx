import { cn } from "@/lib/utils";
import type { Posicion } from "@/lib/datos";

// The shape of each vote (DESIGN.md «Vote tones and marks»): CSS boxes, always next to their text
// label, never colour alone. `null` is «Sin datos».
export function VoteMark({ voto, className }: { voto: Posicion | null; className?: string }) {
  const base = "inline-block shrink-0 align-middle [forced-color-adjust:none]";
  switch (voto) {
    case "S":
      return <span aria-hidden="true" className={cn(base, "size-3 rounded-full bg-foreground", className)} />;
    case "N":
      return <span aria-hidden="true" className={cn(base, "size-3 bg-muted-foreground", className)} />;
    case "A":
      return (
        <span
          aria-hidden="true"
          className={cn(base, "size-3 rounded-full border-[3px] border-(--text-secondary)", className)}
        />
      );
    case "X":
      return (
        <span
          aria-hidden="true"
          className={cn(base, "size-[9px] rounded-full border-[1.5px] border-muted-foreground", className)}
        />
      );
    case "D":
      return (
        <span
          aria-hidden="true"
          className={cn(
            base,
            "relative size-3 overflow-hidden rounded-full border-2 border-(--text-secondary)",
            className,
          )}
        >
          <span className="absolute inset-y-0 left-0 w-1/2 bg-(--text-secondary)" />
        </span>
      );
    default:
      return (
        <span
          aria-hidden="true"
          className={cn(base, "size-3 rounded-full border-[1.5px] border-dashed border-muted-foreground", className)}
        />
      );
  }
}
