import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { PanelEstadisticas } from "@/components/estadisticas/panel-estadisticas";

export const metadata: Metadata = { title: "Estadísticas · Prototipo" };

export default function Estadisticas() {
  return (
    <main className="mx-auto min-w-0 max-w-6xl px-4 py-6 sm:px-6 lg:py-10">
      <Badge variant="outline">Prototipo · Datos simulados</Badge>
      <h1 className="mt-3 text-4xl leading-tight md:text-5xl">Los datos, de un vistazo.</h1>
      <p className="mt-4 max-w-2xl text-lg text-(--text-secondary)">
        Demostración del panel de estadísticas con datos ficticios. No representa las votaciones del Congreso.
      </p>
      <PanelEstadisticas />
    </main>
  );
}
