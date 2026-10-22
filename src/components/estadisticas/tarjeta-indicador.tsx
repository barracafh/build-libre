import { Card, CardHeader, CardContent, CardDescription } from "@/components/ui/card";
import type { Indicador } from "@/datos/estadisticas";
import { cn } from "@/lib/utils";

const formatoNumero = new Intl.NumberFormat("es-ES");

export function TarjetaIndicador({ indicador, principal = false }: { indicador: Indicador; principal?: boolean }) {
  return (
    <Card className={cn("gap-3 py-6 [--card-spacing:--spacing(6)]", principal && "bg-brand-yellow ring-0")}>
      <CardHeader>
      <h3 className="text-base font-medium">{indicador.nombre}</h3>
      </CardHeader>
      <CardContent className="space-y-3">
      <p className="font-heading text-5xl tabular-nums">
        {indicador.valor === null ? <><span aria-hidden="true">—</span><span className="sr-only">Sin datos</span></> : formatoNumero.format(indicador.valor)}
      </p>
      <CardDescription className="text-base text-(--text-secondary)">{indicador.descripcion}</CardDescription>
      </CardContent>
    </Card>
  );
}
