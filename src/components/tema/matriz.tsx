import { Fragment } from "react";

import { NombrePartido, nombreCorto } from "@/components/partido";
import { ScrollTable } from "@/components/scroll-table";
import { ETIQUETA, VoteMark, Voto, type Marca } from "@/components/vote-mark";
import type { Iniciativa, Partido } from "@/lib/datos";
import { conteoTexto, fecha, idIniciativa, marcaDe, nombreProponente, tituloCompleto } from "./comun";

type Props = {
  iniciativas: Iniciativa[];
  partidos: Partido[];
  abiertas: Set<string>;
  alternar: (clave: string) => void;
};

// One row per initiative, one column per party: every party answers the same question per row.
export function Matriz({ iniciativas, partidos, abiertas, alternar }: Props) {
  return (
    <ScrollTable label="Votos de cada grupo en cada iniciativa">
      <table className="w-full min-w-[860px] border-collapse text-sm">
        <thead>
          <tr className="border-b text-left align-bottom text-xs text-(--text-secondary)">
            <th scope="col" className="sticky left-0 z-10 w-[clamp(180px,30vw,360px)] bg-card px-3 py-2 font-semibold">
              Iniciativa
            </th>
            {partidos.map((p) => (
              <th key={p.codigo} scope="col" className="px-2 py-2 font-semibold">
                <NombrePartido partido={p} corto />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {iniciativas.map((i) => {
            const abierta = abiertas.has(i.clave);
            return (
              <Fragment key={i.clave}>
                <tr id={idIniciativa(i)} className={`scroll-mt-4 border-b align-top ${abierta ? "bg-muted" : ""}`}>
                  <th
                    scope="row"
                    className={`sticky left-0 z-10 px-3 py-3 text-left font-normal ${abierta ? "bg-muted" : "bg-card"}`}
                  >
                    <button
                      type="button"
                      aria-expanded={abierta}
                      onClick={() => alternar(i.clave)}
                      className="line-clamp-3 text-left font-semibold underline-offset-2 hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                    >
                      <span aria-hidden="true" className="mr-1 font-normal text-muted-foreground">
                        {abierta ? "▾" : "▸"}
                      </span>
                      {tituloCompleto(i.titulo, i.texto)}
                    </button>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {fecha(i.fecha)} · {i.tipo} · propone {nombreProponente(i.proponente, partidos)}
                      {i.votaciones.length > 1 && ` · ${i.votaciones.length} votaciones`}
                    </p>
                  </th>
                  {partidos.map((p) => (
                    // Light tint: identifies the column's party while vote marks keep >= 3:1 on it.
                    <td
                      key={p.codigo}
                      style={{ backgroundColor: `color-mix(in srgb, ${p.color} 12%, transparent)` }}
                      className="px-2 py-3"
                    >
                      <Celda iniciativa={i} partido={p} />
                    </td>
                  ))}
                </tr>
                {abierta && (
                  <tr className="border-b bg-muted">
                    <td colSpan={partidos.length + 1} className="px-3 pt-1 pb-6">
                      <Detalle iniciativa={i} partidos={partidos} />
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </ScrollTable>
  );
}

function Celda({ iniciativa, partido }: { iniciativa: Iniciativa; partido: Partido }) {
  const votos = iniciativa.votaciones.map((v) => marcaDe(v, partido.codigo));
  const detalle = iniciativa.votaciones
    .map((v) => `${tituloCompleto(v.titulo, v.texto)}: ${ETIQUETA[marcaDe(v, partido.codigo)]} (${conteoTexto(v, partido.codigo)})`)
    .join("\n");
  if (votos.length === 0) return <span className="text-muted-foreground">—</span>;
  if (new Set(votos).size === 1) {
    return (
      <div title={detalle} className="flex flex-col gap-0.5">
        <Voto voto={votos[0]} />
        {votos.length > 1 && <span className="text-xs text-(--text-secondary)">en las {votos.length}</span>}
      </div>
    );
  }
  const cuenta = (["S", "N", "A", "D", "X", "0"] as Marca[])
    .map((m) => [m, votos.filter((v) => v === m).length] as const)
    .filter(([, n]) => n);
  return (
    <div title={detalle} className="flex flex-col gap-1">
      <span aria-hidden="true" className="flex max-w-20 flex-wrap gap-[3px]">
        {votos.map((v, k) => (
          <VoteMark key={k} voto={v} className="size-2" />
        ))}
      </span>
      <span className="text-xs text-(--text-secondary) tabular-nums">
        {cuenta.map(([m, n]) => `${n} ${ETIQUETA[m].toLowerCase()}`).join(" · ")}
      </span>
    </div>
  );
}

function Detalle({ iniciativa: i, partidos }: { iniciativa: Iniciativa; partidos: Partido[] }) {
  return (
    // Sticky so the text stays in view on a phone while the wide table scrolls.
    <div className="sticky left-3 flex max-w-[min(72rem,calc(100vw-4rem))] flex-col gap-4">
      <p className="max-w-[72ch] text-base">{i.texto}</p>
      <p className="text-sm text-muted-foreground">
        {i.tipo} · propone {nombreProponente(i.proponente, partidos)}
        {i.clave.includes("/") && ` · expediente ${i.clave}`}
        {i.enmiendas.length > 0 && ` · ${i.enmiendas.length} votaciones de enmiendas`}
      </p>
      {i.sesiones.length > 0 && (
        <p className="text-sm">
          Sesiones:{" "}
          {i.sesiones.map((s, k) => (
            <Fragment key={s.id}>
              {k > 0 && " · "}
              {s.diario ? (
                <a className="underline" href={s.diario}>
                  {s.organo} {fecha(s.fecha)} ↗
                </a>
              ) : (
                `${s.organo} ${fecha(s.fecha)}`
              )}
            </Fragment>
          ))}
        </p>
      )}
      <ScrollTable label="Cada votación de la iniciativa">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b text-left text-xs text-(--text-secondary)">
              <th scope="col" className="px-3 py-2">Votación</th>
              {partidos.map((p) => (
                <th key={p.codigo} scope="col" className="px-2 py-2">
                  {nombreCorto(p.nombre)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {i.votaciones.map((v) => (
              <tr key={v.id} className="border-b align-top last:border-0">
                <td className="px-3 py-2">
                  {tituloCompleto(v.titulo, v.texto)}
                  <span className="mt-1 block text-xs text-muted-foreground tabular-nums">
                    Sí {v.totales.si} · No {v.totales.no} · Abst. {v.totales.abstencion} ·{" "}
                    <a className="underline" href={v.fuente}>
                      Votación oficial ↗
                    </a>
                  </span>
                </td>
                {partidos.map((p) => (
                  <td key={p.codigo} className="px-2 py-2">
                    <Voto voto={marcaDe(v, p.codigo)} />
                    <span className="block text-xs text-muted-foreground">{conteoTexto(v, p.codigo)}</span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollTable>
      {i.enmiendas.length > 0 && (
        <details>
          <summary className="min-h-11 cursor-pointer py-3 text-sm font-semibold">
            Votaciones de enmiendas ({i.enmiendas.length})
          </summary>
          <ul className="flex flex-col gap-2 text-sm">
            {i.enmiendas.map((v) => (
              <li key={v.id}>
                <a href={v.fuente} className="inline-block min-h-11 py-2 underline">
                  {fecha(v.fecha)} · {v.titulo} · Votación oficial ↗
                </a>
              </li>
            ))}
          </ul>
        </details>
      )}
      <h3 className="text-[17px] font-semibold">Motivos de cada grupo</h3>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {partidos.map((p) => {
          const conMotivo = i.votaciones.filter((v) => v.motivos[p.codigo]);
          return (
            <li key={p.codigo} className="flex flex-col gap-1 rounded-lg border bg-card p-3 text-sm">
              <NombrePartido partido={p} className="font-semibold" />
              {conMotivo.length ? conMotivo.map((v) => {
                const m = v.motivos[p.codigo];
                return (
                  <div key={v.id} className="flex flex-col gap-1 border-t pt-2">
                    <a href={v.fuente} className="inline-block min-h-11 py-2 underline">
                      Votación del {fecha(v.fecha)} · {v.id} ↗
                    </a>
                    <span className="font-mono text-[11px] tracking-[0.06em] text-muted-foreground uppercase">
                      Resumen generado por IA
                    </span>
                    <p>{m.texto}</p>
                    <p className="text-xs text-muted-foreground">
                      {m.orador} · {fecha(m.fecha)}
                      {m.diario && (
                        <>
                          {" · "}
                          <a className="underline" href={m.diario}>
                            Diario de Sesiones ↗
                          </a>
                        </>
                      )}
                    </p>
                  </div>
                );
              }) : (
                <p className="text-muted-foreground">Sin intervención registrada en los datos.</p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
