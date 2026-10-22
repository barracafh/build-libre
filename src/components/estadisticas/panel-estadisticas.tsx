import { Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TablaEstadistica } from "./tabla-estadistica";
import { Fuentes } from "@/components/fuentes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { indicadores, evolucion, distribucion } from "@/datos/estadisticas";
import { BloqueEstadistico } from "./bloque-estadistico";
import { TarjetaIndicador } from "./tarjeta-indicador";

import { GraficoEstadistico } from "./grafico-estadistico";

const secciones = [
  { id: "resumen", nombre: "Resumen" },
  { id: "evolucion", nombre: "Evolución" },
  { id: "detalle", nombre: "Detalle" },
  { id: "fuentes", nombre: "Fuentes" },
] as const;

export function PanelEstadisticas() {
  return (
    <Tabs defaultValue="resumen" className="mt-8 min-w-0 gap-6">
      <TabsList aria-label="Secciones de estadísticas" className="grid h-auto w-full grid-cols-2 gap-1 sm:w-fit sm:grid-cols-4">
        {secciones.map((seccion) => (
          <TabsTrigger key={seccion.id} value={seccion.id} className="min-h-11 px-4 text-base">{seccion.nombre}</TabsTrigger>
        ))}
      </TabsList>
      <Alert role="note" className="p-4">
        <Info aria-hidden="true" />
        <AlertTitle>Datos simulados</AlertTitle>
        <AlertDescription>Estas cifras son ficticias y sirven únicamente para mostrar el panel.</AlertDescription>
      </Alert>
      <TabsContent value="resumen" className="space-y-6">
        <section aria-label="Indicadores principales" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {indicadores.map((indicador, index) => <TarjetaIndicador key={indicador.id} indicador={indicador} principal={index === 0} />)}
        </section>
        <div className="grid gap-6 lg:grid-cols-2">
          <BloqueEstadistico titulo="Evolución en el tiempo" descripcion="Registros por mes en la muestra de ejemplo.">
            <GraficoEstadistico datos={evolucion} tipo="evolucion" titulo="Serie mensual" />
          </BloqueEstadistico>
          <BloqueEstadistico titulo="Distribución por categoría" descripcion="Registros acumulados por grupo en la muestra.">
            <GraficoEstadistico datos={distribucion} tipo="distribucion" titulo="Comparativa de grupos" />
          </BloqueEstadistico>
        </div>
      </TabsContent>
      <TabsContent value="evolucion">
        <BloqueEstadistico titulo="Evolución en el tiempo" descripcion="Detalle de los seis meses de la muestra ficticia.">
          <GraficoEstadistico datos={evolucion} tipo="evolucion" titulo="Serie mensual" />
        </BloqueEstadistico>
      </TabsContent>
      <TabsContent value="detalle">
        <BloqueEstadistico titulo="Detalle de los datos" descripcion="Los registros que sustentan los indicadores del resumen.">
          <div className="mt-6">
            <TablaEstadistica datos={evolucion} titulo="Registros mensuales" columna="Periodo" />
          </div>
        </BloqueEstadistico>
      </TabsContent>
      <TabsContent value="fuentes">
        <BloqueEstadistico titulo="Origen y alcance" descripcion="Cada indicador deberá enlazar al conjunto de datos oficial que lo sustenta.">
          <dl className="my-6 grid gap-6 sm:grid-cols-3">
            {["Fuente estadística", "Última actualización", "Ámbito territorial"].map((nombre) => (
              <div key={nombre}><dt className="font-medium">{nombre}</dt><dd className="mt-1 text-base text-(--text-secondary)">Pendiente de definir</dd></div>
            ))}
          </dl>
          <Fuentes fuentes={[]} />
          <p className="mt-3 text-base text-(--text-secondary)">Los datos de esta demostración son ficticios, creados para mostrar el diseño. No provienen de una fuente oficial ni permiten extraer conclusiones sobre la ciudadanía.</p>
        </BloqueEstadistico>
      </TabsContent>
    </Tabs>
  );
}
