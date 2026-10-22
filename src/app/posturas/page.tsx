import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Fuentes } from "@/components/fuentes";
import { FormularioTemas } from "@/components/posturas/formulario-temas";
import { FUENTES, instantanea, resumenes, votaciones } from "@/lib/datos";

import { temas } from "@/lib/cuestiones";

export const metadata: Metadata = { title: "Temas" };

const numero = new Intl.NumberFormat("es-ES", { useGrouping: "always" });
const fechaLarga = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const formatoFecha = (iso: string) => fechaLarga.format(new Date(`${iso}T00:00:00Z`));

const fuentes = [
  {
    nombre: "Votaciones del Pleno · Congreso de los Diputados",
    url: "https://www.congreso.es/es/opendata/votaciones",
  },
  {
    nombre: "Escaño Abierto (recopilación de los datos del Congreso, CC BY 4.0)",
    url: FUENTES.escanoAbierto,
  },
];

export default function Inicio() {
  const lista = temas();
  const conTema = resumenes().filter((v) => v.temas.length > 0).length;
  const primera = votaciones()[0]?.fecha;
  const { ultimaVotacion } = instantanea();

  return (
    <>
      <h1 className="max-w-3xl text-[28px] leading-tight text-balance lg:text-[36px]">
        ¿Qué ha votado cada partido en el Congreso?
      </h1>
      <p className="mt-3 max-w-[72ch] text-base text-(--text-secondary)">
        Votaciones del Pleno de la XV legislatura
        {primera && ultimaVotacion
          ? `, del ${formatoFecha(primera)} al ${formatoFecha(ultimaVotacion)}`
          : ""}
        , ordenadas por tema. Cada votación enlaza su registro oficial en congreso.es.
      </p>

      <dl className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-3">
        {/* La única tarjeta con el sol de la vista: el dato que más importa. */}
        <Card className="gap-1 px-4 py-4 ring-0 [background:radial-gradient(120%_90%_at_100%_0%,#ffd34d_0%,rgba(255,211,77,0)_60%),var(--brand-yellow)]">
          <dt className="text-sm font-medium">Votaciones con tema</dt>
          <dd className="font-heading text-[32px] leading-none tabular-nums lg:text-[40px]">
            {numero.format(conTema)}
          </dd>
        </Card>
        <Card className="gap-1 px-4 py-4">
          <dt className="text-sm text-(--text-secondary)">Temas</dt>
          <dd className="font-heading text-[32px] leading-none tabular-nums lg:text-[40px]">
            {numero.format(lista.length)}
          </dd>
        </Card>
        <Card className="col-span-2 gap-1 px-4 py-4 lg:col-span-1">
          <dt className="text-sm text-(--text-secondary)">Periodo</dt>
          <dd className="font-heading text-[32px] leading-none tabular-nums lg:text-[40px]">
            {primera && ultimaVotacion
              ? `${primera.slice(0, 4)}–${ultimaVotacion.slice(0, 4)}`
              : "XV legislatura"}
          </dd>
        </Card>
      </dl>

      <section aria-labelledby="elige-temas" className="mt-10">
        <h2 id="elige-temas" className="scroll-mt-4 text-xl lg:text-2xl">
          Elige un tema o compara varios
        </h2>
        <FormularioTemas />
      </section>

      <div className="mt-10">
        <Fuentes fuentes={fuentes} />
      </div>
    </>
  );
}
