import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Fuentes } from "@/components/Fuentes";
import { ETIQUETA, FUENTES, partidos, type Partido, type Posicion } from "@/lib/datos";
import { conteoPorPartido, cuestionesDeTema, tema, temas, type Cuestion } from "@/lib/cuestiones";
import { propuestasDeTema } from "@/lib/propuestas";
import { TarjetaPartido } from "@/components/tarjeta-partido";
import { VoteMark } from "@/components/vote-mark";

type Props = { params: Promise<{ tema: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return temas().map((t) => ({ tema: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = tema((await params).tema);
  return t ? { title: `${t.nombre} · Qué ha votado cada partido` } : {};
}

const numero = new Intl.NumberFormat("es-ES", { useGrouping: "always" });
const fechaCorta = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});
const formatoFecha = (iso: string) => fechaCorta.format(new Date(`${iso.slice(0, 10)}T00:00:00Z`));
const plural = (n: number, uno: string, varios: string) =>
  `${numero.format(n)} ${n === 1 ? uno : varios}`;

// Fixed column order of the table, never sorted by a figure.
const COLUMNAS: { posicion: Posicion; titulo: string }[] = [
  { posicion: "S", titulo: "A favor" },
  { posicion: "N", titulo: "En contra" },
  { posicion: "A", titulo: "Abstención" },
  { posicion: "D", titulo: "Dividido" },
  { posicion: "X", titulo: "No vota" },
];

function Cifra({ n }: { n: number }) {
  if (n > 0) return <>{numero.format(n)}</>;
  return (
    <>
      <span aria-hidden="true">–</span>
      <span className="sr-only">0</span>
    </>
  );
}

function TablaCuestion({ cuestion, lista }: { cuestion: Cuestion; lista: Partido[] }) {
  const conteo = conteoPorPartido(cuestion.votaciones);
  const filas = lista.filter((p) => conteo[p.codigo]);
  return (
    <div className="relative mt-3 overflow-x-auto rounded-lg border bg-card">
      <table className="w-full min-w-[20rem] border-collapse text-sm">
        <caption className="sr-only">
          {cuestion.nombre}: número de votaciones en que cada grupo votó a favor, en contra, se
          abstuvo, se dividió o no votó. Grupos en orden alfabético.
        </caption>
        <thead>
          <tr className="border-b">
            <th scope="col" className="px-3 py-2 text-left font-medium">
              Grupo
            </th>
            {COLUMNAS.map((c) => (
              <th
                key={c.posicion}
                scope="col"
                className="px-2 py-2 text-right align-bottom font-medium"
              >
                <span className="inline-flex items-center justify-end gap-1.5">
                  <VoteMark voto={c.posicion} />
                  {c.titulo}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((p) => (
            <tr key={p.codigo} className="border-b last:border-b-0">
              <th scope="row" className="px-3 py-2 text-left font-normal">
                {p.nombre}
              </th>
              {COLUMNAS.map((c) => (
                <td key={c.posicion} className="px-2 py-2 text-right tabular-nums">
                  <Cifra n={conteo[p.codigo][c.posicion]} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ListaVotaciones({ cuestion, lista }: { cuestion: Cuestion; lista: Partido[] }) {
  const recientes = [...cuestion.votaciones].sort((a, b) => b.fecha.localeCompare(a.fecha));
  return (
    <details className="group mt-3 rounded-lg border bg-card">
      <summary className="flex min-h-11 cursor-pointer items-center gap-2 px-4 py-2 font-medium">
        <span
          aria-hidden="true"
          className="size-2 shrink-0 rotate-45 border-r-2 border-b-2 border-foreground transition-transform group-open:-rotate-135"
        />
        Ver las {plural(recientes.length, "votación", "votaciones")}
      </summary>
      <ol className="divide-y border-t">
        {recientes.map((v) => (
          <li key={v.id} className="px-4 py-3">
            <p className="font-mono text-sm text-(--text-secondary)">
              {formatoFecha(v.fecha)} · {v.tipo}
            </p>
            <Link
              href={`/votacion/${v.id}`}
              className="mt-1 line-clamp-3 underline underline-offset-2 hover:decoration-2"
            >
              {v.titulo}
            </Link>
            <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Posición de cada grupo">
              {lista
                .filter((p) => v.partidos[p.codigo])
                .map((p) => (
                  <li key={p.codigo}>
                    <Badge variant="outline" className="h-auto gap-1.5 py-0.5 text-sm font-normal">
                      <span className="font-mono">{p.codigo}</span>
                      <VoteMark voto={v.partidos[p.codigo]} />
                      {ETIQUETA[v.partidos[p.codigo]]}
                    </Badge>
                  </li>
                ))}
            </ul>
          </li>
        ))}
      </ol>
    </details>
  );
}

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

export default async function PaginaTema({ params }: Props) {
  const slug = (await params).tema;
  const t = tema(slug);
  if (!t) notFound();
  const lista = partidos();
  const cuestiones = cuestionesDeTema(slug);
  const propuestas = propuestasDeTema(slug);

  return (
    <>
      <p className="text-sm">
        <Link href="/" className="inline-flex min-h-11 items-center underline underline-offset-2">
          Todos los temas
        </Link>
      </p>
      <h1 className="max-w-3xl text-[28px] leading-tight text-balance lg:text-[36px]">
        ¿Qué ha votado cada partido sobre {t.nombre.charAt(0).toLowerCase() + t.nombre.slice(1)}?
      </h1>
      <p className="mt-3 max-w-[72ch] text-base text-(--text-secondary)">
        {plural(t.votaciones, "votación", "votaciones")} del Pleno en la XV legislatura, agrupadas
        en {plural(t.cuestiones, "cuestión", "cuestiones")}. Cada cifra cuenta en cuántas votaciones
        el grupo tomó esa posición; «Dividido» es que ninguna opción llegó al 80 % de los votos
        emitidos del grupo. Grupos en orden alfabético.
      </p>

      <nav aria-label="En esta página" className="mt-6">
        <ul className="flex flex-wrap gap-x-6">
          <li>
            <a
              href="#por-grupo"
              className="inline-flex min-h-11 items-center underline underline-offset-2 hover:decoration-2"
            >
              Por grupo
            </a>
          </li>
          <li>
            <a
              href="#por-cuestion"
              className="inline-flex min-h-11 items-center underline underline-offset-2 hover:decoration-2"
            >
              Por cuestión
            </a>
          </li>
        </ul>
      </nav>

      <section id="por-grupo" aria-labelledby="por-grupo-titulo" className="mt-8 scroll-mt-4">
        <h2 id="por-grupo-titulo" className="text-xl lg:text-2xl">
          Por grupo
        </h2>
        <p className="mt-3 text-base text-(--text-secondary)">
          Las votaciones sobre una misma iniciativa cuentan juntas. Grupos en orden alfabético.
        </p>
        <p className="mt-3 font-mono text-sm text-(--text-secondary)">
          Pulsa un grupo para ver sus votaciones. Todos aparecen cerrados; orden alfabético.
        </p>
        <div className="mt-4 grid gap-3">
          {lista.map((p) => (
            <TarjetaPartido
              plegable
              key={p.codigo}
              partido={p}
              temaSlug={slug}
              temaNombre={t.nombre}
              cuestiones={cuestiones}
              lineas={propuestas[p.codigo] ?? []}
            />
          ))}
        </div>
      </section>

      <section
        id="por-cuestion"
        aria-labelledby="por-cuestion-titulo"
        className="mt-12 scroll-mt-4"
      >
        <h2 id="por-cuestion-titulo" className="text-xl lg:text-2xl">
          Por cuestión
        </h2>
        {cuestiones.map((c) => (
          <section key={c.slug} aria-labelledby={`c-${c.slug}`} className="mt-8">
            <h3 id={`c-${c.slug}`} className="text-[17px] font-semibold">
              {c.nombre}{" "}
              <span className="text-base font-normal text-(--text-secondary) tabular-nums">
                · {plural(c.votaciones.length, "votación", "votaciones")}
              </span>
            </h3>
            <TablaCuestion cuestion={c} lista={lista} />
            <ListaVotaciones cuestion={c} lista={lista} />
          </section>
        ))}
      </section>

      <div className="mt-10">
        <Fuentes fuentes={fuentes} />
      </div>
    </>
  );
}
