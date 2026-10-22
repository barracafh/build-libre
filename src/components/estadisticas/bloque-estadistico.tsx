import type { ReactNode } from "react";
import { Card, CardHeader, CardDescription, CardContent } from "@/components/ui/card";

import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";

export function BloqueEstadistico({ titulo, descripcion, icono, children }: {
  titulo: string;
  descripcion: string;
  icono?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <Card className="min-w-0 gap-0 py-6 [--card-spacing:--spacing(6)]">
      <CardHeader>
        <h2 className="text-2xl">{titulo}</h2>
        <CardDescription className="mt-2 text-base text-(--text-secondary)">{descripcion}</CardDescription>
      </CardHeader>
      <CardContent>
        {children ?? (
          <Empty className="mt-6 min-h-56 bg-muted">
            <EmptyHeader>
              {icono && <EmptyMedia aria-hidden="true">{icono}</EmptyMedia>}
              <EmptyTitle>Todavía no hay datos</EmptyTitle>
              <EmptyDescription>La visualización aparecerá cuando haya una fuente estadística conectada.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
    </Card>
  );
}
