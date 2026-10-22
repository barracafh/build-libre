import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Fuentes } from "@/components/Fuentes";
import { VoteMark } from "@/components/vote-mark";
import { ETIQUETA, TEMAS, partidos, votacion, type Votacion, type Voto } from "@/lib/datos";

// 2,185 votes: rendered on demand, never listed with generateStaticParams.
type Props = { params: Promise<{ id: string }> };

const fechaLarga = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const fecha = (iso: string) => fechaLarga.format(new Date(`${iso}T00:00:00Z`));
const numero = new Intl.NumberFormat("es-ES", { useGrouping: "always" });

const enlace =
  "underline underline-offset-2 hover:decoration-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";

const COLUMNAS: Voto[] = ["S", "N", "A", "X"];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const v = votacion((await params).id);
  return v ? { title: v.titulo, description: v.texto } : {};
}

function nombreProponente(codigo: string | null): string | null {
  if (!codigo) return null;
  if (codigo === "GOB") return "Gobierno";
  return partidos().find((p) => p.codigo === codigo)?.nombre ?? codigo;
}

function EnlaceOficial({ v }: { v: Votacion }) {
  return (
    <a
      href={v.fuente}
      className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11 w-full px-4 sm:w-auto")}
    >
      Votación oficial en congreso.es <span aria-hidden="true">↗</span>
    </a>
  );
}

// The one sun card of the page: the result of the vote.
function Resultado({ v, id }: { v: Votacion; id: string }) {
  const cifras = [
    { voto: "S" as const, valor: v.totales.si },
    { voto: "N" as const, valor: v.totales.no },
    { voto: "A" as const, valor: v.totales.abstencion },
  ];
  return (
    <Card render={<section aria-labelledby={id} />} className="gap-3 bg-brand-yellow px-5 py-5 text-base ring-0">
      <h2 id={id} className="text-xl lg:text-2xl">
        Resultado
      </h2>
      <dl className="grid grid-cols-3 gap-3">
        {cifras.map((c) => (
          <div key={c.voto}>
            <dt className="flex items-center gap-1.5 text-sm font-medium">
              <VoteMark voto={c.voto} />
              {ETIQUETA[c.voto]}
            </dt>
            <dd className="font-heading text-[32px] leading-tight tabular-nums lg:text-[40px]">
              {numero.format(c.valor)}
            </dd>
          </div>
        ))}
      </dl>
      <p className="flex items-center gap-1.5 text-sm">
        <VoteMark voto="X" />
        {ETIQUETA.X}: <span className="tabular-nums">{numero.format(v.totales.noVota)}</span>
      </p>
    </Card>
  );
}

export default async function VotacionPage({ params }: Props) {
  const { id } = await params;
  const v = votacion(id);
  if (!v) notFound();

  const grupos = partidos();
  const proponente = nombreProponente(v.proponente);

  const diarios = [...new Set(Object.values(v.motivos).flatMap((m) => (m.diario ? [m.diario] : [])))];
  const fuentes = [
    { nombre: "Votación oficial en congreso.es", url: v.fuente },
    ...diarios.map((url) => ({ nombre: "Diario de Sesiones del Congreso", url })),
  ];

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_26rem] lg:items-start lg:gap-10">
      <div className="min-w-0">
        <p className="font-mono text-sm text-(--text-secondary) uppercase">
          <time dateTime={v.fecha}>{fecha(v.fecha)}</time> · {v.tipo}
        </p>
        <h1 className="mt-2 max-w-[48rem] text-[22px] leading-snug [overflow-wrap:anywhere] lg:text-[28px]">
          {v.titulo}
        </h1>
        {proponente && (
          <p className="mt-2 text-base text-(--text-secondary)">Propuesta de: {proponente}</p>
        )}

        {/* On phones the official link and the result come right after the title. */}
        <div className="mt-6 space-y-4 lg:hidden">
          <EnlaceOficial v={v} />
          <Resultado v={v} id="resultado-movil" />
        </div>

        <section aria-labelledby="texto" className="mt-8">
          <h2 id="texto" className="text-xl lg:text-2xl">
            Qué se votó
          </h2>
          <p className="mt-2 max-w-[72ch] text-base [overflow-wrap:anywhere]">{v.texto}</p>
          <p className="mt-2 text-sm text-muted-foreground">Texto tal como figura en el registro oficial de la votación.</p>
        </section>

        <section aria-labelledby="grupos" className="mt-10">
          <h2 id="grupos" className="text-xl lg:text-2xl">
            Voto de cada grupo
          </h2>
          <p className="mt-2 max-w-[72ch] text-sm text-(--text-secondary)">
            Posición: la opción que reúne al menos el 80 % de los votos emitidos por el grupo; si
            ninguna llega, «Dividido». Las cifras son los diputados del grupo. Grupos en orden
            alfabético. El Grupo Mixto no aparece: reúne a diputados de formaciones distintas y no tiene una posición común.{" "}
            <Link href="/metodo" className={enlace}>
              Más en Método
            </Link>
            .
          </p>
          <div className="mt-3 overflow-x-auto rounded-lg border bg-card">
            <table className="w-full min-w-[34rem] border-collapse text-sm">
              <caption className="sr-only">
                Posición de cada grupo y voto de sus diputados: Sí, No, Abstención y No vota
              </caption>
              <thead>
                <tr className="border-b text-left text-(--text-secondary)">
                  <th scope="col" className="px-3 py-2 font-medium">
                    Grupo
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Posición
                  </th>
                  {COLUMNAS.map((c) => (
                    <th key={c} scope="col" className="px-3 py-2 text-right font-medium">
                      {ETIQUETA[c]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {grupos.map((p) => {
                  const pos = v.partidos[p.codigo];
                  return (
                    <tr key={p.codigo} className="border-b last:border-b-0">
                      <th scope="row" className="px-3 py-2.5 text-left font-medium">
                        {p.nombre}
                      </th>
                      <td className="px-3 py-2.5">
                        <span className="inline-flex items-center gap-2 whitespace-nowrap">
                          <VoteMark voto={pos?.posicion ?? null} />
                          {pos ? ETIQUETA[pos.posicion] : "Sin datos"}
                        </span>
                      </td>
                      {COLUMNAS.map((c) => (
                        <td key={c} className="px-3 py-2.5 text-right tabular-nums">
                          {pos ? numero.format(pos.conteo[c]) : "—"}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="debate" className="mt-10">
          <h2 id="debate" className="text-xl lg:text-2xl">
            Lo que dijo cada grupo en el debate
          </h2>
          <p className="mt-2 max-w-[72ch] text-sm text-(--text-secondary)">
            Resúmenes generados automáticamente a partir del Diario de Sesiones; el enlace lleva a
            la transcripción oficial.
          </p>
          <ul className="mt-3 divide-y border-y">
            {grupos.map((p) => {
              const m = v.motivos[p.codigo];
              return (
                <li key={p.codigo} className="py-4">
                  <h3 className="text-base font-semibold">{p.nombre}</h3>
                  {m ? (
                    <>
                      <p className="mt-1 max-w-[72ch] text-base">{m.texto}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {m.orador} · <time dateTime={m.fecha}>{fecha(m.fecha)}</time>
                      </p>
                      {m.diario && (
                        <a href={m.diario} className={cn("inline-flex min-h-11 items-center gap-1 text-sm", enlace)}>
                          Diario de Sesiones <span aria-hidden="true">↗</span>
                        </a>
                      )}
                    </>
                  ) : (
                    <p className="mt-1 text-base text-muted-foreground">Sin intervención registrada</p>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        {v.temas.length > 0 && (
          <section aria-labelledby="temas" className="mt-10">
            <h2 id="temas" className="text-xl lg:text-2xl">
              Temas
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {v.temas.map((t) => (
                <li key={t}>
                  <Badge
                    variant="outline"
                    className="h-auto min-h-8 px-3 py-1 text-sm whitespace-normal"
                    render={<Link href={`/tema/${t}`} />}
                  >
                    {TEMAS[t] ?? t}
                  </Badge>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-10">
          <Fuentes fuentes={fuentes} />
        </div>
      </div>

      <aside
        aria-label="Resultado y registro oficial"
        className="hidden space-y-4 lg:sticky lg:top-4 lg:block lg:max-h-[calc(100dvh-2rem)] lg:overflow-y-auto"
      >
        <EnlaceOficial v={v} />
        <Resultado v={v} id="resultado" />
      </aside>
    </div>
  );
}
