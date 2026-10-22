"use client";

import { useState } from "react";

import { ETIQUETA, VoteMark, type Marca } from "@/components/vote-mark";
import type { Iniciativa, Partido } from "@/lib/datos";
import { cumpleFiltro, idIniciativa, type Filtro } from "./comun";
import { FichaGrupo } from "./ficha-grupo";
import { Matriz } from "./matriz";
import { Tiras } from "./tiras";

// The three views of a topic share the open rows and the filter set from the party sheet.
export function VistaTema({ iniciativas, partidos }: { iniciativas: Iniciativa[]; partidos: Partido[] }) {
  const [abiertas, setAbiertas] = useState<Set<string>>(new Set());
  const [filtro, setFiltro] = useState<Filtro | null>(null);
  const [grupo, setGrupo] = useState(partidos[0].codigo);

  const alternar = (clave: string) =>
    setAbiertas((s) => {
      const n = new Set(s);
      if (n.has(clave)) n.delete(clave);
      else n.add(clave);
      return n;
    });

  const irA = (id: string) =>
    requestAnimationFrame(() => {
      const el = document.getElementById(id);
      el?.scrollIntoView({ block: "start" });
      el?.querySelector<HTMLElement>("button")?.focus({ preventScroll: true });
    });

  const abrir = (clave: string) => {
    setFiltro(null);
    setAbiertas((s) => new Set(s).add(clave));
    irA(idIniciativa({ clave }));
  };

  const filtrar = (f: Filtro) => {
    setFiltro(f);
    irA("matriz");
  };

  const visibles = iniciativas.filter((i) => !filtro || i.votaciones.some((v) => cumpleFiltro(filtro, i, v)));

  return (
    <div className="flex flex-col gap-10">
      <ul aria-label="Leyenda" className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-(--text-secondary)">
        {(["S", "N", "A", "D", "X", "0"] as Marca[]).map((m) => (
          <li key={m} className="inline-flex items-center gap-1.5">
            <VoteMark voto={m} />
            {m === "D" ? "Grupo dividido" : ETIQUETA[m]}
          </li>
        ))}
      </ul>

      <section id="matriz" aria-labelledby="h-matriz" className="flex scroll-mt-4 flex-col gap-3">
        <h2 id="h-matriz" className="text-xl lg:text-2xl">
          Cómo votó cada grupo en cada iniciativa
        </h2>
        <p className="max-w-[72ch] text-(--text-secondary)">
          Una fila por iniciativa, de la más reciente a la más antigua. Si se votó por puntos, la celda
          muestra una marca por votación. Abre una fila para ver cada votación oficial y los motivos de
          cada grupo.
        </p>
        <div aria-live="polite">
          {filtro && (
            <div className="flex flex-wrap items-center gap-3 rounded-lg bg-muted px-4 py-2 text-sm">
              <span>
                {visibles.length} {visibles.length === 1 ? "iniciativa" : "iniciativas"} donde{" "}
                <strong>{filtro.texto}</strong>
              </span>
              <button
                type="button"
                onClick={() => setFiltro(null)}
                className="min-h-11 rounded-full border border-(--muted-foreground) bg-background px-4 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                Quitar filtro ×
              </button>
            </div>
          )}
        </div>
        <Matriz iniciativas={visibles} partidos={partidos} abiertas={abiertas} alternar={alternar} />
      </section>

      <section aria-labelledby="h-ficha" className="flex flex-col gap-3">
        <h2 id="h-ficha" className="text-xl lg:text-2xl">
          Los votos de un grupo, contados
        </h2>
        <FichaGrupo
          iniciativas={iniciativas}
          partidos={partidos}
          codigo={grupo}
          elegir={setGrupo}
          filtrar={filtrar}
          abrir={abrir}
        />
      </section>

      <section aria-labelledby="h-tiras" className="flex flex-col gap-3">
        <h2 id="h-tiras" className="text-xl lg:text-2xl">
          Todas las votaciones, en orden
        </h2>
        <p className="max-w-[72ch] text-(--text-secondary)">
          Una marca por votación, por orden de fecha; los días con muchas votaciones ocupan más. Pasa por
          encima para ver cuál es y pulsa para abrirla en la tabla.
        </p>
        <Tiras iniciativas={iniciativas} partidos={partidos} abrir={abrir} />
      </section>
    </div>
  );
}
