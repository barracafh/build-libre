import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Fuentes } from "@/components/fuentes";
import { MapaPosturas } from "@/components/posturas/mapa-posturas";
import { fecha } from "@/components/tema/comun";
import { SelectorTema } from "@/components/tema/selector-tema";
import { VistaTema } from "@/components/tema/vista-tema";
import { FUENTES, TEMAS, temas } from "@/lib/datos";
import { posturasDeTema } from "@/lib/posturas";

type Props = { params: Promise<{ tema: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(TEMAS).map((tema) => ({ tema }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const nombre = TEMAS[(await params).tema];
  return nombre ? { title: `${nombre} · Votaciones por tema` } : {};
}

export default async function PaginaTema({ params }: Props) {
  const slug = (await params).tema;
  const datos = temas();
  const tema = datos.temas.find((t) => t.slug === slug);
  if (!tema) notFound();

  const iniciativas = tema.iniciativas.map((clave) => datos.iniciativas[clave]);
  const fechas = iniciativas.flatMap((i) => i.votaciones.map((v) => v.fecha)).sort();
  const medidas = posturasDeTema(slug);
  const enlaces = [
    { href: "#cronologia", texto: "Cronología" },
    { href: "#por-grupo", texto: "Por grupo" },
    { href: "#matriz", texto: "Iniciativas y votos" },
    ...(medidas.length ? [{ href: "#posturas", texto: "Medidas concretas" }] : []),
  ];

  return (
    <>
      <Link href="/posturas" className="inline-flex min-h-11 items-center underline underline-offset-2">
        Todos los temas
      </Link>
      <div className="mt-3">
        <SelectorTema actual={slug} temas={datos.temas.map(({ slug, nombre }) => ({ slug, nombre }))} />
      </div>
      <h1 className="mt-6 text-h1">{tema.nombre}</h1>
      <p className="mt-3 text-base text-(--text-secondary)">
        {tema.recuento.iniciativas} iniciativas y {tema.recuento.votaciones} votaciones del Pleno en la XV legislatura
        {fechas.length > 0 && `, del ${fecha(fechas[0])} al ${fecha(fechas.at(-1)!)}`}.
        {tema.recuento.enmiendas > 0 && ` Las ${tema.recuento.enmiendas} votaciones de enmiendas se enlazan en el detalle.`}
      </p>
      <p className="mt-3 text-base text-(--text-secondary)">
        Los temas los asigna Escaño Abierto por palabras clave, sin IA. {datos.sinTema.iniciativas} iniciativas
        no tienen tema y no aparecen aquí. Grupos en orden alfabético.
      </p>

      <nav aria-label="Contenido del tema" className="my-6">
        <ul className="flex flex-wrap gap-x-6">
          {enlaces.map((enlace) => (
            <li key={enlace.href}>
              <a href={enlace.href} className="inline-flex min-h-11 items-center underline underline-offset-2">
                {enlace.texto}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <VistaTema iniciativas={iniciativas} partidos={datos.partidos} temaSlug={slug} />

      {medidas.length > 0 && (
        <section id="posturas" aria-labelledby="posturas-titulo" className="mt-10 scroll-mt-4">
          <h2 id="posturas-titulo" className="text-h2">Medidas concretas</h2>
          <MapaPosturas temaSlug={slug} temaNombre={tema.nombre} filas={medidas} partidos={datos.partidos} />
        </section>
      )}

      <div className="mt-10">
        <Fuentes fuentes={[
          { nombre: "Votaciones del Pleno · Congreso de los Diputados", url: "https://www.congreso.es/es/opendata/votaciones" },
          { nombre: "Diario de Sesiones · Congreso de los Diputados", url: "https://www.congreso.es/es/busqueda-de-publicaciones" },
          { nombre: "Escaño Abierto (recopilación de los datos del Congreso, CC BY 4.0)", url: FUENTES.escanoAbierto },
        ]} />
        <p className="mt-3 text-sm text-muted-foreground">
          Instantánea del {fecha(datos.instantanea.fecha)}, commit {datos.instantanea.commit.slice(0, 7)}.
        </p>
      </div>
    </>
  );
}
