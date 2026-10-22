import type { Metadata } from "next";
import Link from "next/link";
import { Fuentes } from "@/components/fuentes";
import { recuentos, type Recuento } from "@/lib/cruce";
import partidos from "@/config/partidos.json";
import sintesis from "@/config/sintesis.json";

export const metadata: Metadata = { title: "Posiciones" };

// Una columna por grupo con entrada en partidos.json (el Grupo Mixto no es un
// partido) y una fila por tema, ambos en orden alfabético.
const grupos = Object.entries(partidos)
  .map(([codigo, p]) => ({ codigo, nombre: p.nombre }))
  .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

const plural = (n: number, uno: string, varios: string) =>
  `${n} ${n === 1 ? uno : varios}`;

function recuento(r: Recuento) {
  const total = r.S + r.N + r.A + r.D;
  const partes = [
    r.S && plural(r.S, "sí", "sí"),
    r.N && plural(r.N, "no", "no"),
    r.A && plural(r.A, "abstención", "abstenciones"),
    r.D && plural(r.D, "dividido", "divididos"),
  ].filter(Boolean);
  return `${plural(total, "votación", "votaciones")}: ${partes.join(", ")}.`;
}

export default async function Posiciones() {
  const tabla = await recuentos();
  const temas = Object.keys(tabla).sort((a, b) => a.localeCompare(b, "es"));

  return (
    <>
      <main
        className="mx-auto max-w-6xl px-4 py-6 outline-none sm:px-6 lg:py-10"
      >
        <h1 className="text-[clamp(30px,4.5vw,48px)] leading-[1.1] tracking-[-0.02em]">
          Posiciones por grupo y tema
        </h1>
        <p className="mt-4 max-w-[72ch] text-(--text-secondary)">
          Cómo votó cada grupo en las votaciones de cada tema, en la XV
          legislatura. La síntesis de cada celda resume las razones que dio el grupo en sus votaciones sobre el tema y está generada por un modelo de lenguaje; debajo, el recuento de votos. Pulsa una celda para ver las
          votaciones y las intervenciones. Grupos y temas van en orden
          alfabético.
        </p>

        <div className="mt-8 overflow-x-auto rounded-xl ring-1 ring-foreground/10">
          <table className="w-[calc(8rem+8*16rem)] table-fixed border-collapse text-sm">
            <caption className="sr-only">
              Recuento de votos de cada grupo por tema
            </caption>
            <thead>
              <tr className="border-b bg-muted">
                <th
                  scope="col"
                  className="sticky left-0 z-10 w-32 bg-muted px-3 py-3 text-left font-medium"
                >
                  Tema
                </th>
                {grupos.map((g) => (
                  <th
                    key={g.codigo}
                    scope="col"
                    className="w-64 px-3 py-3 text-left font-medium"
                  >
                    {g.nombre}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {temas.map((tema) => (
                <tr key={tema} className="border-b last:border-b-0">
                  <th
                    scope="row"
                    className="sticky left-0 z-10 bg-card px-3 py-3 text-left font-medium capitalize"
                  >
                    {tema}
                  </th>
                  {grupos.map((g) => {
                    const r = tabla[tema][g.codigo];
                    const texto = (sintesis as Record<string, string>)[
                      `${g.codigo}|${tema}`
                    ];
                    return (
                      <td key={g.codigo} className="p-0 align-top">
                        {r ? (
                          <Link
                            href={`/posiciones/test?partido=${g.codigo}&tema=${encodeURIComponent(tema)}`}
                            className="block min-h-11 px-3 py-3 outline-none hover:bg-muted focus-visible:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset"
                          >
                            {texto ? <span className="block">{texto}</span> : null}
                            <span className="mt-2 block text-xs text-muted-foreground">
                              {recuento(r)}
                            </span>
                          </Link>
                        ) : (
                          <span className="block px-3 py-3 text-muted-foreground">
                            Sin votaciones
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-10">
          <Fuentes
            fuentes={[
              {
                nombre: "Congreso de los Diputados · Votaciones del Pleno",
                url: "https://www.congreso.es/es/opendata/votaciones",
              },
              {
                nombre: "Escaño Abierto (datos, CC BY 4.0)",
                url: "https://github.com/jorgegarcelan/escano-abierto",
              },
            ]}
          />
        </div>
      </main>

    </>
  );
}
