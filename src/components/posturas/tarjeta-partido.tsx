import Link from "next/link";
import { Card } from "@/components/ui/card";
import { VoteMark } from "@/components/vote-mark";
import type { Partido, Posicion } from "@/lib/datos";
import type { Cuestion } from "@/lib/cuestiones";
import { PROPUESTAS_AVISO, type Linea } from "@/lib/propuestas";
import {
  apoyoPorPartido,
  fraseApoyo,
  iniciativasDeTema,
  type Apoyo,
  type Iniciativa,
} from "@/lib/iniciativas";
import { posturasDeTema } from "@/lib/posturas";
import { frasePartido } from "@/lib/resumen";

const numero = new Intl.NumberFormat("es-ES", { useGrouping: "always" });
const fechaCorta = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});
const formatoFecha = (iso: string) => fechaCorta.format(new Date(`${iso.slice(0, 10)}T00:00:00Z`));
const plural = (n: number, uno: string, varios: string) =>
  `${numero.format(n)} ${n === 1 ? uno : varios}`;

const VACIO: Apoyo = {
  aFavor: [],
  enContra: [],
  abstencion: [],
  segunPunto: [],
  dividido: [],
  noVota: [],
};

// Fixed order, the same for every party. Headings describe the vote, never a stance.
const LISTAS: {
  clave: "aFavor" | "enContra" | "abstencion";
  titulo: string;
  voto: Posicion;
}[] = [
  { clave: "aFavor", titulo: "A favor de", voto: "S" },
  { clave: "enContra", titulo: "En contra de", voto: "N" },
  { clave: "abstencion", titulo: "Se abstuvo en", voto: "A" },
];

/** One-line count summary, same template for every party. */
export function resumenApoyo(a: Apoyo | undefined, minusculas = false): string {
  const x = a ?? VACIO;
  const partes = [
    `A favor de ${numero.format(x.aFavor.length)}`,
    `En contra de ${numero.format(x.enContra.length)}`,
    `Se abstuvo en ${plural(x.abstencion.length, "iniciativa", "iniciativas")}`,
  ];
  if (x.segunPunto.length) partes.push(`Según el punto ${numero.format(x.segunPunto.length)}`);
  const texto = partes.join(" · ");
  return minusculas
    ? texto.replace(/(^|· )([A-ZÁÉÍÓÚ])/g, (_, p, c: string) => p + c.toLowerCase())
    : texto;
}

function ItemIniciativa({ i }: { i: Iniciativa }) {
  return (
    <li>
      <Link
        href={`/posturas/votacion/${i.votaciones[0].id}`}
        className="line-clamp-3 underline underline-offset-2 hover:decoration-2"
      >
        {i.titulo}
      </Link>
      <p className="mt-0.5 text-sm text-(--text-secondary)">
        {i.tipo} · {i.proponenteNombre ?? "Sin proponente"} ·{" "}
        <span className="font-mono">{formatoFecha(i.fecha)}</span>
      </p>
    </li>
  );
}

function ListaIniciativas({
  titulo,
  voto,
  lista,
  visibles,
  nivel,
}: {
  titulo: string;
  voto: Posicion;
  lista: Iniciativa[];
  visibles: number;
  nivel: 3 | 4;
}) {
  const H = nivel === 3 ? "h3" : "h4";
  const resto = lista.slice(visibles);
  return (
    <div className="min-w-0">
      <H className="flex items-center gap-2 text-base font-semibold">
        <VoteMark voto={voto} />
        {titulo}
        <span className="font-normal text-(--text-secondary) tabular-nums">
          ({numero.format(lista.length)})
        </span>
      </H>
      {lista.length === 0 ? (
        <p className="mt-2 text-base text-(--text-secondary)">Ninguna</p>
      ) : (
        <>
          <ul className="mt-2 grid gap-3">
            {lista.slice(0, visibles).map((i) => (
              <ItemIniciativa key={i.id} i={i} />
            ))}
          </ul>
          {resto.length > 0 && (
            <details className="group mt-3">
              <summary className="flex min-h-11 cursor-pointer items-center gap-2 font-medium">
                <span
                  aria-hidden="true"
                  className="size-2 shrink-0 rotate-45 border-r-2 border-b-2 border-foreground transition-transform group-open:-rotate-135 motion-reduce:transition-none"
                />
                Ver las {numero.format(resto.length)} restantes
              </summary>
              <ul className="mt-2 grid gap-3">
                {resto.map((i) => (
                  <ItemIniciativa key={i.id} i={i} />
                ))}
              </ul>
            </details>
          )}
        </>
      )}
    </div>
  );
}

export function TarjetaPartido({
  partido,
  temaSlug,
  temaNombre,
  cuestiones,
  lineas,
  compacta = false,
  nivel = 2,
  plegable = false,
}: {
  partido: Partido;
  temaSlug: string;
  temaNombre: string;
  cuestiones: Cuestion[];
  lineas: Linea[];
  compacta?: boolean;
  nivel?: 2 | 3;
  /** Render as a native <details>, closed by default, with a one-line count summary. */
  plegable?: boolean;
}) {
  const H = nivel === 3 ? "h3" : "h2";
  const sub = nivel === 3 ? 4 : 3;
  const Sub = sub === 3 ? "h3" : "h4";
  const id = `tarjeta-${partido.codigo}-${temaSlug}`.replace(/[^\w-]+/g, "-");

  const apoyo = apoyoPorPartido(iniciativasDeTema(temaSlug))[partido.codigo] ?? VACIO;
  const frases = cuestiones
    .map((c) => ({ slug: c.slug, frase: fraseApoyo(partido.codigo, c) }))
    .filter((f): f is { slug: string; frase: string } => f.frase !== null)
    .slice(0, compacta ? 2 : undefined);
  const visibles = compacta ? 3 : 5;

  const otras = [
    apoyo.segunPunto.length &&
      `Votó según el punto en ${plural(apoyo.segunPunto.length, "iniciativa", "iniciativas")}`,
    apoyo.dividido.length && `Dividido en ${numero.format(apoyo.dividido.length)}`,
    apoyo.noVota.length && `No votó en ${numero.format(apoyo.noVota.length)}`,
  ].filter(Boolean);

  const posturas = frasePartido(posturasDeTema(temaSlug), partido.codigo);

  const top = [...lineas].sort((a, b) => b.n - a.n).slice(0, compacta ? 2 : 3);

  const titulo = (
    <H id={id} className={nivel === 3 ? "text-[17px] font-semibold" : "text-xl lg:text-2xl"}>
      {compacta ? temaNombre : partido.nombre}
    </H>
  );

  const cuerpo = (
    <>
      {posturas && !plegable && (
        <p className="mt-3">
          <span className="font-semibold">Posturas:</span> {posturas}
        </p>
      )}
      <Sub className="mt-4 text-base font-semibold">En resumen</Sub>
      {frases.length ? (
        <div className="mt-1 grid gap-2">
          {frases.map((f) => (
            <p key={f.slug}>{f.frase}</p>
          ))}
        </div>
      ) : (
        <p className="mt-1 text-(--text-secondary)">Sin votaciones registradas en este tema</p>
      )}
      {compacta && (
        <p className="mt-2">
          <Link
            href={`/posturas/tema/${temaSlug}`}
            className="inline-flex min-h-11 items-center underline underline-offset-2 hover:decoration-2"
          >
            Ver todo sobre {temaNombre.charAt(0).toLowerCase() + temaNombre.slice(1)} →
          </Link>
        </p>
      )}

      <div className="mt-5 grid gap-6 sm:grid-cols-3">
        {LISTAS.map((l) => (
          <ListaIniciativas
            key={l.clave}
            titulo={l.titulo}
            voto={l.voto}
            lista={apoyo[l.clave]}
            visibles={visibles}
            nivel={sub}
          />
        ))}
      </div>
      {otras.length > 0 && (
        <p className="mt-4 text-base text-(--text-secondary)">{otras.join(" · ")}</p>
      )}

      <Sub className="mt-6 text-base font-semibold">Lo que defendió en el pleno</Sub>
      {top.length === 0 ? (
        <p className="mt-1 text-(--text-secondary)">Sin intervenciones registradas en este tema</p>
      ) : (
        <>
          <p role="note" className="mt-2 rounded-lg bg-muted px-3 py-2 text-sm">
            {compacta ? "Resumen automático del Diario de Sesiones" : PROPUESTAS_AVISO}
          </p>
          <ul className="mt-3 grid gap-4">
            {top.map((l) => {
              const cita = compacta ? undefined : l.citas[0];
              return (
                <li key={l.titulo}>
                  <p className="font-medium">
                    {l.titulo}{" "}
                    <span className="text-sm font-normal text-(--text-secondary) tabular-nums">
                      ({plural(l.n, "intervención", "intervenciones")})
                    </span>
                  </p>
                  {cita && (
                    <blockquote className="mt-1 border-l-2 pl-3">
                      <p>«{cita.texto}»</p>
                      <footer className="mt-1 text-sm text-(--text-secondary)">
                        {cita.orador} · {formatoFecha(cita.fecha)}
                        {cita.diario && (
                          <>
                            {" · "}
                            <a
                              href={cita.diario}
                              className="underline underline-offset-2 hover:decoration-2"
                            >
                              Diario de Sesiones
                            </a>
                          </>
                        )}
                      </footer>
                    </blockquote>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </>
  );

  if (plegable) {
    return (
      <Card
        render={<details id={`tp-${id.slice("tarjeta-".length)}`} aria-labelledby={id} />}
        className="group/plegable block gap-0 p-0 text-base"
      >
        <summary className="flex min-h-11 cursor-pointer list-none items-start gap-3 rounded-xl px-4 group-open/plegable:rounded-b-none py-4 outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset sm:px-6 [&::-webkit-details-marker]:hidden">
          <span
            aria-hidden="true"
            className="mt-2.5 size-2 shrink-0 rotate-45 border-r-2 border-b-2 border-foreground transition-transform group-open/plegable:-rotate-135 motion-reduce:transition-none"
          />
          <span className="min-w-0">
            {titulo}
            <span className="mt-1 block text-base text-(--text-secondary) tabular-nums">
              {resumenApoyo(apoyo)}
            </span>
            {posturas && (
              <span className="mt-1 block text-sm text-(--text-secondary)">
                Posturas: {posturas}
              </span>
            )}
          </span>
        </summary>
        <div className="border-t px-4 pb-5 sm:px-6">{cuerpo}</div>
      </Card>
    );
  }

  return (
    <Card render={<section aria-labelledby={id} />} className="gap-0 px-4 py-5 text-base sm:px-6">
      {titulo}
      {cuerpo}
    </Card>
  );
}
