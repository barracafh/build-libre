import { Muestra } from "@/components/partido";
import { ETIQUETA, VoteMark, type Marca } from "@/components/vote-mark";
import type { Iniciativa, Partido, Votacion } from "@/lib/datos";
import { TIPOS, fecha, grupoTipo, marcaDe, nombreProponente, tituloCompleto, type Filtro } from "./comun";

type Props = {
  iniciativas: Iniciativa[];
  partidos: Partido[];
  codigo: string;
  elegir: (codigo: string) => void;
  filtrar: (f: Filtro) => void;
  abrir: (clave: string) => void;
};

const COLUMNAS: Marca[] = ["S", "N", "A", "D", "X"];
const CORTA: Partial<Record<Marca, string>> = { A: "Abst.", D: "Div." };

type Fila = { valor: string; etiqueta: string; votos: Votacion[] };

// Counts over official fields only (type of initiative, who proposed it), never across directions.
export function FichaGrupo({ iniciativas, partidos, codigo, elegir, filtrar, abrir }: Props) {
  const partido = partidos.find((p) => p.codigo === codigo)!;
  const pares = iniciativas.flatMap((i) => i.votaciones.map((v) => [i, v] as const));

  const porTipo: Fila[] = TIPOS.map(([g]) => ({
    valor: g,
    etiqueta: g,
    votos: pares.filter(([i]) => grupoTipo(i.tipo) === g).map(([, v]) => v),
  })).filter((f) => f.votos.length);

  const proponentes = [...new Set(iniciativas.map((i) => i.proponente ?? ""))].sort((a, b) =>
    a === "" ? 1 : b === "" ? -1 : nombreProponente(a, partidos).localeCompare(nombreProponente(b, partidos), "es"),
  );
  const porProponente: Fila[] = proponentes.map((pr) => ({
    valor: pr,
    etiqueta: nombreProponente(pr || null, partidos),
    votos: pares.filter(([i]) => (i.proponente ?? "") === pr).map(([, v]) => v),
  }));

  const propias = iniciativas.filter((i) => i.proponente === codigo);
  const conMotivo = iniciativas.filter((i) => i.votaciones.some((v) => v.motivos[codigo])).length;

  const tabla = (titulo: string, filas: Fila[], campo: Filtro["campo"]) => (
    <section className="flex min-w-0 flex-col gap-2 rounded-lg border bg-card p-4">
      <h3 className="text-h3">{titulo}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-xs text-(--text-secondary)">
              <th scope="col" className="py-2 pr-2 text-left font-normal">
                <span className="sr-only">Categoría</span>
              </th>
              {COLUMNAS.map((m) => (
                <th key={m} scope="col" className="px-1 py-2 text-right font-semibold">
                  <span className="inline-flex items-center gap-1">
                    <VoteMark voto={m} className="size-2.5" />
                    {CORTA[m] ? (
                      <>
                        <span aria-hidden="true">{CORTA[m]}</span>
                        <span className="sr-only">{ETIQUETA[m]}</span>
                      </>
                    ) : (
                      ETIQUETA[m]
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filas.map((f) => (
              <tr key={f.valor} className="border-b last:border-0">
                <th scope="row" className="py-1 pr-2 text-left font-normal">
                  {f.etiqueta}
                </th>
                {COLUMNAS.map((m) => {
                  const n = f.votos.filter((v) => marcaDe(v, codigo) === m).length;
                  return (
                    <td key={m} className="px-1 py-1 text-right tabular-nums">
                      {n ? (
                        <button
                          type="button"
                          aria-label={`${n} votaciones: ${ETIQUETA[m]} en ${f.etiqueta}. Ver en la tabla`}
                          onClick={() =>
                            filtrar({
                              codigo,
                              campo,
                              valor: f.valor,
                              voto: m,
                              texto: `${partido.nombre} votó ${ETIQUETA[m].toLowerCase()} · ${
                                campo === "tipo" ? f.etiqueta.toLowerCase() : `propuestas de ${f.etiqueta}`
                              }`,
                            })
                          }
                          className="min-h-11 min-w-11 rounded px-1 underline underline-offset-2 hover:bg-muted"
                        >
                          {n}
                        </button>
                      ) : (
                        <span className="px-1 text-muted-foreground">0</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );

  return (
    <div className="flex flex-col gap-4">
      <div role="group" aria-label="Elige un grupo" className="flex flex-wrap gap-2">
        {partidos.map((p) => (
          <button
            key={p.codigo}
            type="button"
            aria-pressed={p.codigo === codigo}
            onClick={() => elegir(p.codigo)}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-(--muted-foreground) px-4 text-sm hover:bg-muted aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground"
          >
            <Muestra color={p.color} />
            {p.nombre}
          </button>
        ))}
      </div>
      <p className="text-sm text-(--text-secondary)">
        Se cuentan votaciones, no iniciativas: una moción votada en 8 puntos suma 8. Cada cifra muestra
        esas votaciones en la tabla.
      </p>
      <div className="grid items-start gap-3 lg:grid-cols-3">
        {tabla("Por tipo de iniciativa", porTipo, "tipo")}
        {tabla("Por quién la propuso", porProponente, "proponente")}
        <section className="flex flex-col gap-2 rounded-lg border bg-card p-4 text-sm">
          <h3 className="text-h3">Iniciativas que propuso: {propias.length}</h3>
          {propias.length ? (
            <ul className="flex flex-col gap-2">
              {propias.map((i) => (
                <li key={i.clave}>
                  <span className="block text-xs text-muted-foreground">{fecha(i.fecha)}</span>
                  <button
                    type="button"
                    onClick={() => abrir(i.clave)}
                    className="min-h-11 py-2 text-left underline underline-offset-2"
                  >
                    {tituloCompleto(i.titulo, i.texto)}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">Ninguna en este tema.</p>
          )}
          <p className="text-muted-foreground">
            Tiene motivo registrado en {conMotivo} de {iniciativas.length} iniciativas.
          </p>
        </section>
      </div>
    </div>
  );
}
