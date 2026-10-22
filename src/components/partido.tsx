import { cn } from "@/lib/utils";
import type { Partido } from "@/lib/datos";

// A party's colour only identifies it, always next to its name, with a 1 px edge for contrast
// (DESIGN.md · Party colours).
export function Muestra({ color, className }: { color: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      style={{ backgroundColor: color }}
      className={cn("inline-block size-3 shrink-0 rounded-[2px] border border-foreground", className)}
    />
  );
}

// "Grupo Socialista" → "Socialista", for narrow columns; the full name stays in the page.
export const nombreCorto = (nombre: string) =>
  nombre.replace(/^Grupo /, "").replace(" (EAJ-PNV)", " (PNV)");

export function NombrePartido({
  partido,
  corto,
  className,
}: {
  partido: Pick<Partido, "nombre" | "color">;
  corto?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <Muestra color={partido.color} />
      {corto ? nombreCorto(partido.nombre) : partido.nombre}
    </span>
  );
}
