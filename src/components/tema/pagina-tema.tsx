import { notFound } from "next/navigation";

import { Fuentes } from "@/components/fuentes";
import { fecha } from "@/components/tema/comun";
import { SelectorTema } from "@/components/tema/selector-tema";
import { VistaTema } from "@/components/tema/vista-tema";
import { temas } from "@/lib/datos";

// Shared by /iniciativas (default topic) and /iniciativas/[slug].
export function PaginaTema({ slug }: { slug: string }) {
  const d = temas();
  const tema = d.temas.find((t) => t.slug === slug);
  if (!tema) notFound();
  const iniciativas = tema.iniciativas.map((clave) => d.iniciativas[clave]);
  const fechas = iniciativas.flatMap((i) => i.votaciones.map((v) => v.fecha)).sort();

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-6 sm:px-6 lg:py-10">
      <SelectorTema actual={slug} temas={d.temas.map(({ slug, nombre }) => ({ slug, nombre }))} />
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs tracking-[0.06em] text-muted-foreground uppercase">
          Tema · Pleno del Congreso · XV legislatura
        </p>
        <h1 className="text-h1">{tema.nombre}</h1>
        <p className="max-w-[72ch] text-(--text-secondary)">
          {tema.recuento.iniciativas} iniciativas y {tema.recuento.votaciones} votaciones
          {fechas.length > 0 && `, del ${fecha(fechas[0])} al ${fecha(fechas.at(-1)!)}`}.
          {tema.recuento.enmiendas > 0 && ` Las ${tema.recuento.enmiendas} votaciones de enmiendas se enlazan en el detalle.`}
        </p>
        <p className="max-w-[72ch] text-sm text-muted-foreground">
          Los temas los asigna Escaño Abierto por palabras clave, sin IA. {d.sinTema.iniciativas} iniciativas no
          tienen tema y no aparecen aquí.
        </p>
      </div>
      <VistaTema
        iniciativas={iniciativas}
        partidos={d.partidos}
        fuentes={
          <Fuentes
            fuentes={[
              { nombre: "Datos abiertos del Congreso de los Diputados", url: "https://www.congreso.es/es/datos-abiertos" },
              { nombre: "Escaño Abierto: votaciones, temas y motivos resumidos por IA", url: "https://github.com/jorgegarcelan/escano-abierto" },
            ]}
          />
        }
      />
      <p className="max-w-[72ch] text-sm text-muted-foreground">
        Instantánea del {fecha(d.instantanea.fecha)}, commit {d.instantanea.commit.slice(0, 7)}.
      </p>
    </main>
  );
}
