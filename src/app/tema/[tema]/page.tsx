import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Fuentes } from "@/components/Fuentes";
import { ETIQUETA, FUENTES, partidos, type Partido, type Posicion } from "@/lib/datos";
import { conteoPorPartido, cuestionesDeTema, tema, temas, type Cuestion } from "@/lib/cuestiones";
import { PROPUESTAS_AVISO, propuestasDeTema, type Linea } from "@/lib/propuestas";
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
              <th key={c.posicion} scope="col" className="px-2 py-2 text-right align-bottom font-medium">
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

function LineasPartido({ lineas }: { lineas: Linea[] | undefined }) {
  const top = [...(lineas ?? [])].sort((a, b) => b.n - a.n).slice(0, 3);
  if (!top.length)
    return (
      <p className="mt-2 text-base text-(--text-secondary)">
        Sin intervenciones registradas en este tema
      </p>
    );
  return (
    <ul className="mt-2 grid gap-4">
      {top.map((l) => {
        const cita = l.citas[0];
        return (
          <li key={l.titulo}>
            <p className="font-medium">
              {l.titulo}{" "}
              <span className="text-sm font-normal text-(--text-secondary) tabular-nums">
                ({plural(l.n, "intervención", "intervenciones")})
              </span>
            </p>
            {cita && (
              <blockquote className="mt-1 border-l-2 pl-3">
                <p>«{cita.texto}»</p>
                <footer className="mt-1 text-sm text-(--text-secondary)">
                  {cita.orador} · {formatoFecha(cita.fecha)}
                  {cita.diario && (
                    <>
                      {" · "}
                      <a href={cita.diario} className="underline underline-offset-2 hover:decoration-2">
                        Diario de Sesiones
                      </a>
                    </>
                  )}
                </footer>
              </blockquote>
            )}
          </li>
        );
      })}
    </ul>
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
        {plural(t.votaciones, "votación", "votaciones")} del Pleno en la XV legislatura,
        agrupadas en {plural(t.cuestiones, "cuestión", "cuestiones")}. Cada cifra cuenta en
        cuántas votaciones el grupo tomó esa posición; «Dividido» es que ninguna opción llegó al
        80 % de los votos emitidos del grupo. Grupos en orden alfabético.
      </p>

      {cuestiones.map((c) => (
        <section key={c.slug} aria-labelledby={`c-${c.slug}`} className="mt-10">
          <h2 id={`c-${c.slug}`} className="text-xl lg:text-2xl">
            {c.nombre}{" "}
            <span className="font-sans text-base text-(--text-secondary) tabular-nums">
              · {plural(c.votaciones.length, "votación", "votaciones")}
            </span>
          </h2>
          <TablaCuestion cuestion={c} lista={lista} />
          <ListaVotaciones cuestion={c} lista={lista} />
        </section>
      ))}

      <section aria-labelledby="defendido" className="mt-10">
        <h2 id="defendido" className="text-xl lg:text-2xl">
          Lo que ha defendido cada grupo en el pleno
        </h2>
        <p role="note" className="mt-3 max-w-[72ch] rounded-lg bg-muted px-4 py-3 text-base">
          {PROPUESTAS_AVISO}
        </p>
        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          {lista.map((p) => (
            <section key={p.codigo} aria-labelledby={`p-${p.codigo}`}>
              <h3 id={`p-${p.codigo}`} className="text-[17px] font-semibold">
                {p.nombre}
              </h3>
              <LineasPartido lineas={propuestas[p.codigo]} />
            </section>
          ))}
        </div>
      </section>

      <div className="mt-10">
        <Fuentes fuentes={fuentes} />
      </div>
    </>
  );
}
