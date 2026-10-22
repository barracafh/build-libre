import type { Metadata } from "next";
import Link from "next/link";
import { Fuentes } from "@/components/fuentes";
import { PROGRAMAS } from "@/components/posturas/programas";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Los programas de 2023",
  description:
    "Copias de los programas electorales de las elecciones generales del 23 de julio de 2023.",
};

const numero = new Intl.NumberFormat("es-ES", { useGrouping: "always" });

const enlace =
  "underline underline-offset-2 hover:decoration-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";

export default function Programas() {
  return (
    <>
      <h1 className="max-w-3xl text-[28px] leading-tight text-balance lg:text-[36px]">
        Los programas de 2023
      </h1>
      <p className="mt-3 max-w-[72ch] text-base text-(--text-secondary)">
        Copias de los programas electorales de las elecciones generales del 23 de julio de 2023, tal
        como los publicó cada partido. Las promesas que mostramos citan la página exacta.
      </p>

      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PROGRAMAS.map((p) => (
          <li key={p.sigla} className="flex">
            <Card className="w-full gap-3 px-4 text-base">
              <div>
                <h2 className="font-sans text-[17px] font-semibold">{p.partido}</h2>
                <p className="mt-1 text-sm text-(--text-secondary)">
                  <span className="tabular-nums">{numero.format(p.paginas)} páginas</span>
                  {p.idioma === "ca" && " · en catalán"}
                </p>
              </div>
              <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2">
                <a
                  href={p.archivo}
                  target="_blank"
                  rel="noopener"
                  className={buttonVariants({ variant: "outline", className: "h-11 px-3" })}
                >
                  Abrir el programa (PDF) ↗
                  <span className="sr-only"> de {p.partido}, se abre en otra pestaña</span>
                </a>
                <a
                  href={p.fuente}
                  target="_blank"
                  rel="noopener"
                  className={`inline-flex min-h-11 items-center text-sm text-(--text-secondary) ${enlace}`}
                >
                  Fuente original{p.fuente.includes("web.archive.org") && " (vía archive.org)"} ↗
                  <span className="sr-only"> de {p.partido}, se abre en otra pestaña</span>
                </a>
              </div>
            </Card>
          </li>
        ))}
      </ul>

      <section aria-labelledby="como-se-extraen" className="mt-10">
        <h2 id="como-se-extraen" className="text-xl lg:text-2xl">
          Cómo se extraen las promesas
        </h2>
        <p className="mt-2 max-w-[72ch] text-base">
          Las promesas son citas literales sacadas del texto de estos PDF, con su número de página.
          Qué promesa corresponde a cada medida se revisa a mano, y la comparación con lo que votó
          cada grupo es una regla, no el juicio de un modelo.{" "}
          <Link href="/posturas/metodo#posturas" className={enlace}>
            Cómo se hace
          </Link>
        </p>
      </section>

      <div className="mt-10">
        <Fuentes
          fuentes={PROGRAMAS.map((p) => ({
            nombre: `Programa electoral 2023 · ${p.partido}`,
            url: p.fuente,
          }))}
        />
      </div>
    </>
  );
}
