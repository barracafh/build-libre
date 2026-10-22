import type { Metadata } from "next";

import { CardLink } from "@/components/card-link";
import { Fuentes } from "@/components/fuentes";
import { temas } from "@/lib/datos";

export const metadata: Metadata = { title: "Temas" };

export default function Temas() {
  const { temas: lista, sinTema } = temas();
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-6 sm:px-6 lg:py-10">
      <div className="flex flex-col gap-3">
        <h1 className="text-[28px] leading-tight lg:text-4xl">Temas</h1>
        <p className="max-w-[72ch] text-(--text-secondary)">
          Elige un tema para ver cómo votó cada grupo en el Pleno, iniciativa a iniciativa. Los temas
          los asigna Escaño Abierto por palabras clave, sin IA. {sinTema.iniciativas} iniciativas no
          tienen tema y no aparecen aquí.
        </p>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {lista.map((t) => (
          <li key={t.slug}>
            <CardLink href={`/tema/${t.slug}`} titulo={t.nombre}>
              {t.recuento.iniciativas} iniciativas · {t.recuento.votaciones} votaciones
            </CardLink>
          </li>
        ))}
      </ul>
      <Fuentes
        fuentes={[{ nombre: "Escaño Abierto, temas por palabras clave", url: "https://github.com/jorgegarcelan/escano-abierto" }]}
      />
    </main>
  );
}
