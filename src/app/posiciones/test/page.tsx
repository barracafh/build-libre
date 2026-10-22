import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Fuentes } from "@/components/fuentes";
import { cruzar, type Sentido } from "@/lib/cruce";
import { sintetizar } from "@/lib/sintesis";
import partidos from "@/config/partidos.json";
import guardadas from "@/config/sintesis.json";

export const metadata: Metadata = { title: "Detalle de posiciones" };

// Detalle: /posiciones/test?partido=PP&tema=vivienda
// `partido` es el código de grupo de los datos y `tema` uno de los temas de `tm`.

const sentidos: Record<Sentido, { texto: string; marca: string }> = {
  S: { texto: "Sí", marca: "●" },
  N: { texto: "No", marca: "✕" },
  A: { texto: "Abstención", marca: "○" },
  D: { texto: "Dividido", marca: "◐" },
  "?": { texto: "Sin dato", marca: "–" },
};

const nombrePartido = (codigo: string) =>
  (partidos as Record<string, { nombre: string }>)[codigo]?.nombre ??
  (codigo === "MIXTO" ? "Grupo Mixto" : codigo);

const fecha = (iso: string) =>
  new Date(iso).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

const un = (p: string | string[] | undefined) =>
  (Array.isArray(p) ? p[0] : p)?.trim() ?? "";

export default async function DetallePosicion({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const partido = un(params.partido).toUpperCase();
  const tema = un(params.tema).toLowerCase();

  const resultado = partido && tema ? await cruzar(partido, tema) : null;
  const sintesisTexto = resultado
    ? ((guardadas as Record<string, string>)[`${partido}|${tema}`] ??
      (await sintetizar(nombrePartido(partido), tema, resultado.razones)))
    : null;

  return (
    <>
      <main
        className="mx-auto max-w-6xl px-4 py-6 outline-none sm:px-6 lg:py-10"
      >
        <p className="font-mono text-xs tracking-[0.06em] text-(--text-secondary) uppercase">
          <Link href="/posiciones" className="underline underline-offset-4">Volver a posiciones</Link>
        </p>
        <h1 className="mt-3 text-[clamp(30px,4.5vw,48px)] leading-[1.1] tracking-[-0.02em]">
          {resultado
            ? `${nombrePartido(partido)} · ${tema}`
            : "Partido y tema"}
        </h1>

        {!resultado ? (
          <p className="mt-4 max-w-[72ch] text-(--text-secondary)">
            Indica el grupo y el tema en la URL, por ejemplo{" "}
            <a className="underline" href="?partido=PP&tema=vivienda">
              ?partido=PP&amp;tema=vivienda
            </a>
            .
          </p>
        ) : (
          <>
            <p className="mt-4 max-w-[72ch] text-(--text-secondary)">
              {resultado.votos.length} votaciones del tema «{tema}» y{" "}
              {resultado.intervenciones.length} intervenciones del grupo en los
              debates de esas votaciones.
            </p>

            <section aria-labelledby="sintesis" className="mt-8">
              <h2 id="sintesis" className="text-2xl font-medium">
                Síntesis de las razones del voto
              </h2>
              {sintesisTexto ? (
                <Card className="mt-4 max-w-[72ch] gap-2 px-4">
                  <p className="text-base leading-relaxed">{sintesisTexto}</p>
                  <p className="text-sm text-muted-foreground">
                    Texto generado por un modelo de lenguaje a partir de{" "}
                    {resultado.razones.length} razones de voto del grupo,
                    también generadas en origen. No es un texto oficial.
                  </p>
                </Card>
              ) : (
                <p className="mt-3 text-(--text-secondary)">
                  {resultado.razones.length
                    ? "La síntesis no está disponible ahora mismo."
                    : "Los datos no recogen razones de voto de este grupo en este tema."}
                </p>
              )}
            </section>

            <section aria-labelledby="votaciones" className="mt-10">
              <h2 id="votaciones" className="text-2xl font-medium">
                Votaciones
              </h2>
              {resultado.votos.length === 0 ? (
                <p className="mt-3 text-(--text-secondary)">
                  No hay votaciones de este grupo sobre este tema.
                </p>
              ) : (
                <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {resultado.votos.map((v) => (
                    <li key={v.id} className="flex">
                      <Card className="w-full gap-3 px-4">
                        <p className="text-sm text-muted-foreground">
                          {fecha(v.fecha)}
                        </p>
                        <h3 className="text-base leading-snug font-medium">
                          {v.titulo}
                        </h3>
                        <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
                          <Badge variant="outline" className="h-6 text-sm">
                            <span aria-hidden="true">
                              {sentidos[v.sentido].marca}
                            </span>
                            {nombrePartido(partido)}:{" "}
                            {sentidos[v.sentido].texto}
                          </Badge>
                          <a
                            href={v.url}
                            className="text-sm underline underline-offset-2"
                          >
                            Votación oficial <span aria-hidden="true">↗</span>
                          </a>
                        </div>
                      </Card>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section aria-labelledby="intervenciones" className="mt-10">
              <h2 id="intervenciones" className="text-2xl font-medium">
                Intervenciones
              </h2>
              {resultado.intervenciones.length === 0 ? (
                <p className="mt-3 text-(--text-secondary)">
                  No hay intervenciones con cita de este grupo en esos debates.
                </p>
              ) : (
                <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {resultado.intervenciones.map((i) => (
                    <li key={i.cita} className="flex">
                      <Card className="w-full gap-3 px-4">
                        <blockquote className="text-base leading-relaxed">
                          «{i.cita}»
                        </blockquote>
                        <p className="mt-auto text-sm">
                          <span className="font-medium">{i.orador}</span>
                          <span className="text-muted-foreground">
                            {" "}
                            · {fecha(i.fecha)}
                          </span>
                        </p>
                      </Card>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <div className="mt-10">
              <Fuentes
                fuentes={[
                  {
                    nombre: "Congreso de los Diputados · Diario de Sesiones",
                    url: "https://www.congreso.es/es/publicaciones-oficiales",
                  },
                  {
                    nombre: "Escaño Abierto (datos, CC BY 4.0)",
                    url: "https://github.com/jorgegarcelan/escano-abierto",
                  },
                ]}
              />
            </div>
          </>
        )}
      </main>

    </>
  );
}
