// Resumen automático de un tema, antes del detalle: hasta 5 frases generadas una vez con IA
// (scripts/resumenes.ts), una por iniciativa. El modelo solo redacta qué se votó y si salió adelante;
// la fecha, lo que votó cada grupo y el enlace a la votación salen aquí de los datos.
// Componente de servidor: lee el disco a través de resumenes.ts e iniciativas.ts.

import Link from "next/link";

import { Card } from "@/components/ui/card";
import { partidos } from "@/lib/datos";
import { ETIQUETA_INICIATIVA, iniciativasDeTema, type Iniciativa, type PosicionIniciativa } from "@/lib/iniciativas";
import { resumenDeTema } from "@/lib/resumenes";

const fechaLarga = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

const fechaCorta = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const ORDEN: PosicionIniciativa[] = ["S", "N", "A", "V", "D", "X"];

// «A favor: EH Bildu, Grupo Socialista; en contra: …», en orden alfabético y sin grupos vacíos.
function votosDeGrupos(i: Iniciativa): string {
  const nombres = partidos()
    .map((p) => ({ codigo: p.codigo, nombre: p.nombre }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  return ORDEN.map((pos) => {
    const lista = nombres.filter((p) => (i.posiciones[p.codigo] ?? "X") === pos).map((p) => p.nombre);
    return lista.length ? `${ETIQUETA_INICIATIVA[pos]}: ${lista.join(", ")}` : null;
  })
    .filter((x): x is string => x !== null)
    .map((x, k) => (k === 0 ? x : x[0].toLowerCase() + x.slice(1)))
    .join("; ");
}

export function ResumenTema({ slug }: { slug: string }) {
  const resumen = resumenDeTema(slug);
  if (!resumen) return null;
  const porId = new Map(iniciativasDeTema(slug).map((i) => [i.id, i]));

  // Una nota por iniciativa, numerada por orden de aparición; si se repite, conserva su número.
  const numeros = new Map<string, number>();
  const frases = resumen.frases.map((f) => ({
    texto: f.texto,
    citas: f.iniciativas
      .map((id) => porId.get(id))
      .filter((i): i is Iniciativa => i !== undefined && i.votaciones.length > 0)
      .map((i) => {
        if (!numeros.has(i.id)) numeros.set(i.id, numeros.size + 1);
        return {
          n: numeros.get(i.id)!,
          votacion: i.votaciones[0].id,
          titulo: i.titulo,
          datos: `${fechaCorta.format(new Date(`${i.fecha.slice(0, 10)}T00:00:00Z`))} · ${votosDeGrupos(i)}`,
        };
      }),
  }));
  const fecha = fechaLarga.format(new Date(resumen.generado));

  return (
    <Card render={<section aria-labelledby="resumen-tema" />} className="mt-6 gap-3 px-4 text-base">
      <p id="resumen-tema" className="font-mono text-xs tracking-wide text-(--text-secondary) uppercase">
        Resumen automático
      </p>
      {frases.map((f, k) => (
        <p key={k} className="text-base leading-relaxed">
          {f.texto}
          {f.citas.map((c) => (
            <span key={c.n}>
              <span className="text-(--text-secondary)"> · {c.datos}</span>
              <Link
                href={`/votacion/${c.votacion}`}
                title={c.titulo}
                aria-label={`Votación ${c.n}: ${c.titulo}`}
                className="ml-0.5 align-super font-mono text-xs underline underline-offset-2 hover:decoration-2"
              >
                [{c.n}]
              </Link>
            </span>
          ))}
        </p>
      ))}
      <p className="text-sm text-(--text-secondary)">
        Generado por un modelo a partir de las votaciones enlazadas ({fecha}); comprueba las pruebas en cada
        medida.
      </p>
    </Card>
  );
}
