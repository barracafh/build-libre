"use client";

import { TablaEstadistica } from "./TablaEstadistica";
import { useId } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid,
  XAxis, YAxis,
} from "recharts";
import type { PuntoEstadistico } from "@/datos/estadisticas";

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

const config = { valor: { label: "Registros" } } satisfies ChartConfig;

export function GraficoEstadistico({ datos, tipo, titulo }: {
  datos: PuntoEstadistico[];
  tipo: "evolucion" | "distribucion";
  titulo: string;
}) {
  const captionId = useId();
  const Chart = tipo === "evolucion" ? AreaChart : BarChart;

  return (
    <figure aria-labelledby={captionId} className="mt-6 min-w-0">
      <figcaption id={captionId} className="mb-4 font-mono text-xs tracking-wider text-(--text-secondary) uppercase">
        {titulo} · Datos simulados
      </figcaption>
      <ChartContainer config={config} className="h-64 w-full min-w-0 aspect-auto sm:h-72">
          <Chart data={datos} accessibilityLayer margin={{ top: 12, right: 12, bottom: 8, left: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis dataKey="nombre" axisLine={false} tickLine={false} tickMargin={12} tick={{ fill: "var(--text-secondary)", fontSize: 12 }} minTickGap={8} />
            <YAxis width={40} axisLine={false} tickLine={false} allowDecimals={false} tick={{ fill: "var(--text-secondary)", fontSize: 12 }} />
            <ChartTooltip
              isAnimationActive={false}
              cursor={{ stroke: "var(--border)", fill: "var(--muted)" }}
              content={<ChartTooltipContent hideIndicator />}
            />
            {tipo === "evolucion" ? (
              <Area dataKey="valor" name="Registros" type="linear" stroke="var(--foreground)" strokeWidth={2} fill="var(--muted)" fillOpacity={1} isAnimationActive={false} dot={{ r: 3, fill: "var(--foreground)" }} />
            ) : (
              <Bar dataKey="valor" name="Registros" fill="var(--foreground)" maxBarSize={56} isAnimationActive={false} />
            )}
          </Chart>
      </ChartContainer>
      <Collapsible className="mt-4 border-t pt-4 text-base">
        <CollapsibleTrigger render={<Button variant="outline" className="min-h-11 h-auto w-full justify-between gap-3 py-2 whitespace-normal text-left text-base" />}>
          Ver los valores en tabla
          <ChevronDown aria-hidden="true" className="size-4 shrink-0" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4">
          <TablaEstadistica datos={datos} titulo={titulo} columna={tipo === "evolucion" ? "Periodo" : "Categoría"} />
        </CollapsibleContent>
      </Collapsible>
    </figure>
  );
}
