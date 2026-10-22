import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Fuentes } from "@/components/Fuentes";
import { FUENTES, instantanea, resumenes, votaciones } from "@/lib/datos";

import { temas } from "@/lib/cuestiones";

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

      <section aria-labelledby="temas" className="mt-10">
        <h2 id="temas" className="text-xl lg:text-2xl">
          Elige un tema
        </h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {lista.map((t) => (
            <li key={t.slug}>
              <Link
                href={`/tema/${t.slug}`}
                className="flex h-full min-h-11 items-center justify-between gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10 transition-shadow hover:ring-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
              >
                <span className="min-w-0">
                  <span className="block font-semibold">{t.nombre}</span>
                  <span className="mt-1 block text-sm text-(--text-secondary) tabular-nums">
                    {numero.format(t.votaciones)}{" "}
                    {t.votaciones === 1 ? "votación" : "votaciones"} ·{" "}
                    {numero.format(t.cuestiones)}{" "}
                    {t.cuestiones === 1 ? "cuestión" : "cuestiones"}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="size-2 shrink-0 rotate-45 border-t-2 border-r-2 border-foreground"
                />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-10">
        <Fuentes fuentes={fuentes} />
      </div>
    </>
  );
}
