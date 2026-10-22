import Link from "next/link";
import { Card } from "@/components/ui/card";
import { VoteMark } from "@/components/vote-mark";
import type { Partido } from "@/lib/datos";
import {
  ETIQUETA_POSTURA,
  ETIQUETA_SENTIDO,
  type FilaPostura,
  type Postura,
  type PosturaPartido,
  type Prueba,
  type Sentido,
} from "@/lib/posturas";

// Legend order; "V" (según el punto) is listed only once posturas.ts defines it.
const POSTURAS = (["F", "C", "M", "V", "A", "S"] as string[]).filter(
  (p): p is Postura => p in ETIQUETA_POSTURA,
);

const fechaCorta = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});
const formatoFecha = (iso: string) => fechaCorta.format(new Date(`${iso.slice(0, 10)}T00:00:00Z`));
const numero = new Intl.NumberFormat("es-ES", { useGrouping: "always" });
const votacionesTexto = (n: number) => `${numero.format(n)} ${n === 1 ? "votación" : "votaciones"}`;
const total = (p: PosturaPartido) => p.aFavor + p.enContra + p.abstencion + p.otras;

const enlace = "underline underline-offset-2 hover:decoration-2";
const chevron =
  "size-2 shrink-0 rotate-45 border-r-2 border-b-2 border-foreground transition-transform motion-reduce:transition-none";

// Stance shapes reuse the vote marks (DESIGN.md «Vote tones and marks»); «Sin votaciones» is a dash.
function MarcaPostura({ postura }: { postura: Postura }) {
  if (postura === "S")
    return (
      <span
        aria-hidden="true"
        className="inline-block h-0.5 w-3 shrink-0 bg-muted-foreground align-middle [forced-color-adjust:none]"
      />
    );
  // «Mixta» and «Según el punto» share the half-filled shape; the word tells them apart.
  const voto: Record<string, "S" | "N" | "A" | "D"> = { F: "S", C: "N", A: "A", M: "D", V: "D" };
  return <VoteMark voto={voto[postura] ?? null} />;
}

function MarcaSentido({ sentido }: { sentido: Sentido }) {
  const voto = { F: "S", C: "N", A: "A", V: "D", X: "X" } as const;
  return <VoteMark voto={voto[sentido]} />;
}

function ListaPruebas({ pruebas }: { pruebas: Prueba[] }) {
  if (!pruebas.length)
    return <p className="text-base text-(--text-secondary)">Sin votaciones sobre esta medida.</p>;
  return (
    <ul className="grid gap-3">
      {pruebas.map((p) => {
        const ini = p.iniciativa;
        const id = ini.votaciones[0]?.id;
        return (
          <li key={ini.id} className="text-base">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <MarcaSentido sentido={p.sentido} />
              {ETIQUETA_SENTIDO[p.sentido]}
            </span>
            {" · "}
            {id ? (
              <Link href={`/votacion/${id}`} className={enlace}>
                {ini.titulo}
              </Link>
            ) : (
              ini.titulo
            )}
            <span className="mt-0.5 block font-mono text-sm text-(--text-secondary)">
              {[ini.tipo, ini.proponenteNombre, formatoFecha(ini.fecha)].filter(Boolean).join(" · ")}
            </span>
            {p.nota && <span className="mt-0.5 block text-sm text-(--text-secondary)">{p.nota}</span>}
          </li>
        );
      })}
    </ul>
  );
}

function Leyenda() {
  return (
    <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-base" aria-label="Leyenda">
      {POSTURAS.map((p) => (
        <li key={p} className="inline-flex items-center gap-1.5">
          <MarcaPostura postura={p} />
          {ETIQUETA_POSTURA[p]}
        </li>
      ))}
    </ul>
  );
}

function Celda({ dato, compacto }: { dato: PosturaPartido | undefined; compacto?: boolean }) {
  const postura = dato?.postura ?? "S";
  return (
    <span className="flex flex-col items-start gap-1">
      <MarcaPostura postura={postura} />
      <span className="text-sm leading-snug">{ETIQUETA_POSTURA[postura]}</span>
      {!compacto && dato && (
        <span className="text-sm leading-snug text-(--text-secondary) tabular-nums">
          {votacionesTexto(total(dato))}
        </span>
      )}
    </span>
  );
}

export function MapaPosturas({
  temaSlug,
  temaNombre,
  filas,
  partidos,
  compacto,
}: {
  temaSlug: string;
  temaNombre: string;
  filas: FilaPostura[];
  partidos: Partido[];
  compacto?: boolean;
}) {
  if (!filas.length) return null;
  const columnas = partidos.length + 1;

  return (
    <div>
      <Leyenda />
      {!compacto && (
        <p className="mt-3 text-base text-(--text-secondary)">
          Postura calculada a partir de las votaciones enlazadas; cada medida indica qué significa
          votar sí.{" "}
          <Link href="/metodo#posturas" className={enlace}>
            Cómo se calcula
          </Link>
        </p>
      )}

      {/* Desktop: one table, a row per measure; the evidence opens under each row. */}
      <div className="relative mt-4 hidden overflow-x-auto rounded-lg border bg-card lg:block">
        <table className="w-full min-w-[60rem] table-fixed border-collapse">
          <caption className="sr-only">
            Postura de cada grupo en cada medida de {temaNombre}. Grupos en orden alfabético.
          </caption>
          <colgroup>
            <col className="w-64" />
            {partidos.map((p) => (
              <col key={p.codigo} />
            ))}
          </colgroup>
          <thead>
            <tr className="border-b">
              <th scope="col" className="px-3 py-2 text-left align-bottom text-sm font-medium">
                Medida
              </th>
              {partidos.map((p) => (
                <th
                  key={p.codigo}
                  scope="col"
                  className="px-2 py-2 text-left align-bottom text-sm leading-snug font-medium"
                >
                  {p.nombre}
                </th>
              ))}
            </tr>
          </thead>
          {filas.map((f) => (
            <tbody key={f.enunciado.slug} className="border-b last:border-b-0">
              <tr>
                <th scope="row" className="px-3 py-3 text-left align-top text-base font-medium">
                  {f.enunciado.texto}
                </th>
                {partidos.map((p) => (
                  <td key={p.codigo} className="px-2 py-3 align-top">
                    <Celda dato={f.porPartido[p.codigo]} compacto={compacto} />
                  </td>
                ))}
              </tr>
              {!compacto && (
                <tr>
                  <td colSpan={columnas} className="px-3 pb-3">
                    <details className="group/medida">
                      <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-md text-base underline underline-offset-2 hover:decoration-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground [&::-webkit-details-marker]:hidden">
                        <span aria-hidden="true" className={`${chevron} group-open/medida:-rotate-135`} />
                        Ver las votaciones de «{f.enunciado.texto}»
                      </summary>
                      <div className="mt-2 grid grid-cols-2 gap-x-8 gap-y-5 border-t pt-4">
                        {partidos.map((p) => {
                          const d = f.porPartido[p.codigo];
                          return (
                            <section key={p.codigo} aria-label={p.nombre}>
                              <h4 className="flex flex-wrap items-center gap-x-2 text-base font-semibold">
                                {p.nombre}
                                <span className="inline-flex items-center gap-1.5 font-normal text-(--text-secondary)">
                                  · <MarcaPostura postura={d?.postura ?? "S"} />
                                  {ETIQUETA_POSTURA[d?.postura ?? "S"]}
                                </span>
                              </h4>
                              <div className="mt-2">
                                <ListaPruebas pruebas={d?.pruebas ?? []} />
                              </div>
                            </section>
                          );
                        })}
                      </div>
                    </details>
                  </td>
                </tr>
              )}
            </tbody>
          ))}
        </table>
      </div>

      {/* Phone: a card per measure, a row per group; each row opens its votes. */}
      <div className="mt-4 grid gap-3 lg:hidden">
        {filas.map((f) => (
          <Card key={f.enunciado.slug} className="px-4 text-base">
            <h3 className="text-[17px] font-semibold">{f.enunciado.texto}</h3>
            <ul className="grid gap-x-6 sm:grid-cols-2">
              {partidos.map((p) => {
                const d = f.porPartido[p.codigo];
                const postura = d?.postura ?? "S";
                const resumen = (
                  <>
                    <span className="min-w-0 flex-1">{p.nombre}</span>
                    <span className="inline-flex shrink-0 items-center gap-1.5">
                      <MarcaPostura postura={postura} />
                      {ETIQUETA_POSTURA[postura]}
                    </span>
                    {!compacto && d && (
                      <span className="w-8 shrink-0 text-right text-sm text-(--text-secondary) tabular-nums">
                        <span aria-hidden="true">{numero.format(total(d))}</span>
                        <span className="sr-only">{votacionesTexto(total(d))}</span>
                      </span>
                    )}
                  </>
                );
                return (
                  <li key={p.codigo} className="border-t">
                    {compacto || !d ? (
                      <div className="flex min-h-11 items-center gap-2 py-2">{resumen}</div>
                    ) : (
                      <details className="group/fila">
                        <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 py-2 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground [&::-webkit-details-marker]:hidden">
                          <span aria-hidden="true" className={`${chevron} group-open/fila:-rotate-135`} />
                          {resumen}
                        </summary>
                        <div className="pb-3 pl-4">
                          <ListaPruebas pruebas={d.pruebas} />
                        </div>
                      </details>
                    )}
                  </li>
                );
              })}
            </ul>
          </Card>
        ))}
      </div>

      {compacto && (
        <p className="mt-3 text-base">
          <Link
            href={`/tema/${temaSlug}#posturas`}
            className={`inline-flex min-h-11 items-center ${enlace}`}
          >
            Ver las votaciones de {temaNombre.charAt(0).toLowerCase() + temaNombre.slice(1)} →
          </Link>
        </p>
      )}
    </div>
  );
}
