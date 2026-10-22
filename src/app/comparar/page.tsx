import type { Metadata } from "next";
import Link from "next/link";
import { Fuentes } from "@/components/Fuentes";
import { FormularioTemas } from "@/components/formulario-temas";
import { TarjetaPartido, resumenApoyo } from "@/components/tarjeta-partido";
import { FUENTES, partidos } from "@/lib/datos";
import { cuestionesDeTema, temas } from "@/lib/cuestiones";
import { propuestasDeTema } from "@/lib/propuestas";
import { apoyoPorPartido, iniciativasDeTema } from "@/lib/iniciativas";

export const metadata: Metadata = { title: "Comparar por temas" };

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const MAXIMO = 5;

// Progressive enhancement: open the group's <details> targeted by the URL hash.
const ABRIR_DESTINO = `(() => {
  const abrir = () => {
    const el = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (el instanceof HTMLDetailsElement) el.open = true;
  };
  abrir();
  addEventListener("hashchange", abrir);
  document.addEventListener("click", (e) => {
    const a = e.target instanceof Element && e.target.closest('a[href^="#g-"]');
    if (a && a.getAttribute("href") === location.hash) setTimeout(abrir);
  });
})();`;

const fuentes = [
  {
    nombre: "Votaciones del Pleno · Congreso de los Diputados",
    url: "https://www.congreso.es/es/opendata/votaciones",
  },
  {
    nombre: "Diario de Sesiones · Congreso de los Diputados",
    url: "https://www.congreso.es/es/busqueda-de-publicaciones",
  },
  {
    nombre: "Escaño Abierto (recopilación de los datos del Congreso, CC BY 4.0)",
    url: FUENTES.escanoAbierto,
  },
];

const minuscula = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
const enumerar = (lista: string[]) =>
  lista.length < 2 ? lista.join("") : `${lista.slice(0, -1).join(", ")} y ${lista.at(-1)}`;

export default async function Comparar({ searchParams }: Props) {
  const crudo = (await searchParams).temas;
  const pedidos = new Set(
    (Array.isArray(crudo) ? crudo : crudo ? [crudo] : [])
      .flatMap((v) => v.split(","))
      .map((v) => v.trim())
      .filter(Boolean),
  );
  // temas() is already alphabetical by nombre; filtering it keeps that order and dedupes.
  const validos = temas().filter((t) => pedidos.has(t.slug));
  const elegidos = validos.slice(0, MAXIMO);

  if (!elegidos.length) {
    return (
      <>
        <h1 className="max-w-3xl text-[28px] leading-tight text-balance lg:text-[36px]">
          Elige los temas que te importan
        </h1>
        <FormularioTemas />
        <div className="mt-10">
          <Fuentes fuentes={fuentes} />
        </div>
      </>
    );
  }

  const lista = partidos();
  const datosTema = elegidos.map((t) => ({
    ...t,
    cuestiones: cuestionesDeTema(t.slug),
    propuestas: propuestasDeTema(t.slug),
    apoyo: apoyoPorPartido(iniciativasDeTema(t.slug)),
  }));

  return (
    <>
      <p className="text-sm">
        <Link
          href="/#elige-temas"
          className="inline-flex min-h-11 items-center underline underline-offset-2"
        >
          Cambiar temas
        </Link>
      </p>
      <h1 className="max-w-3xl text-[28px] leading-tight text-balance lg:text-[36px]">
        Qué ha hecho cada grupo en {enumerar(elegidos.map((t) => minuscula(t.nombre)))}
      </h1>
      <p className="mt-3 max-w-[72ch] text-base text-(--text-secondary)">
        XV legislatura. Grupos en orden alfabético; mismo formato para todos. Cada dato enlaza su
        votación o su sesión oficial.
      </p>
      {validos.length > MAXIMO && (
        <p role="note" className="mt-3 max-w-[72ch] rounded-lg bg-muted px-4 py-3 text-base">
          Se muestran los cinco primeros temas.
        </p>
      )}

      <nav aria-label="Grupos" className="mt-6">
        <ul className="flex flex-wrap gap-x-4 gap-y-1">
          {lista.map((p) => (
            <li key={p.codigo}>
              <a
                href={`#g-${p.codigo}`}
                className="inline-flex min-h-11 items-center text-base underline underline-offset-2 hover:decoration-2"
              >
                {p.nombre}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <p className="mt-6 font-mono text-sm text-(--text-secondary)">
        Pulsa un grupo para ver sus votaciones. Todos aparecen cerrados; orden alfabético.
      </p>
      <div className="mt-4 grid gap-3">
        {lista.map((p) => (
          <details
            key={p.codigo}
            id={`g-${p.codigo}`}
            aria-labelledby={`g-${p.codigo}-titulo`}
            className="group/grupo scroll-mt-4 rounded-xl border"
          >
            <summary className="flex min-h-11 cursor-pointer list-none items-start gap-3 rounded-xl px-4 group-open/grupo:rounded-b-none py-4 outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset sm:px-6 [&::-webkit-details-marker]:hidden">
              <span
                aria-hidden="true"
                className="mt-2.5 size-2 shrink-0 rotate-45 border-r-2 border-b-2 border-foreground transition-transform group-open/grupo:-rotate-135 motion-reduce:transition-none"
              />
              <span className="min-w-0">
                <h2 id={`g-${p.codigo}-titulo`} className="text-xl lg:text-2xl">
                  {p.nombre}
                </h2>
                {datosTema.map((t) => (
                  <span
                    key={t.slug}
                    className="mt-1 block text-base text-(--text-secondary) tabular-nums"
                  >
                    {t.nombre}: {resumenApoyo(t.apoyo[p.codigo], true)}
                  </span>
                ))}
              </span>
            </summary>
            <div className="grid gap-3 border-t p-3 sm:p-4">
              {datosTema.map((t) => (
                <TarjetaPartido
                  key={t.slug}
                  partido={p}
                  temaSlug={t.slug}
                  temaNombre={t.nombre}
                  cuestiones={t.cuestiones}
                  lineas={t.propuestas[p.codigo] ?? []}
                  compacta
                  nivel={3}
                />
              ))}
            </div>
          </details>
        ))}
      </div>
      <script dangerouslySetInnerHTML={{ __html: ABRIR_DESTINO }} />

      <div className="mt-10">
        <Fuentes fuentes={fuentes} />
      </div>
    </>
  );
}
