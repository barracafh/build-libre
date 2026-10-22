import Link from "next/link";
import { Button } from "@/components/ui/button";
import { temas } from "@/lib/cuestiones";
import { ruta } from "@/config/sitio";

const numero = new Intl.NumberFormat("es-ES");

// Tema picker, not an opinion quiz: it only chooses which temas to show, for every group alike.
export function FormularioTemas({ seleccionados = [] }: { seleccionados?: string[] }) {
  const marcados = new Set(seleccionados);
  return (
    <form method="get" action={ruta("/posturas/comparar")} className="mt-3">
      <fieldset>
        <legend className="text-base text-(--text-secondary)">
          Abre un tema para ver sus votaciones o marca hasta cinco para consultarlos juntos.
        </legend>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {temas().map((t) => (
            <li key={t.slug} className="flex min-w-0 flex-col rounded-xl border bg-card p-4">
              <Link
                href={`/posturas/tema/${t.slug}`}
                className="flex min-h-11 items-center justify-between gap-3 font-semibold underline underline-offset-2"
              >
                {t.nombre}
                <span aria-hidden="true">→</span>
              </Link>
              <p className="mt-1 text-base text-(--text-secondary) tabular-nums">
                {numero.format(t.votaciones)}{" "}
                {t.votaciones === 1 ? "votación" : "votaciones"}
              </p>
              <label className="mt-auto flex min-h-11 cursor-pointer items-center gap-3 pt-2 text-base">
                <input
                  type="checkbox"
                  name="temas"
                  value={t.slug}
                  defaultChecked={marcados.has(t.slug)}
                  className="size-5 shrink-0 accent-foreground"
                />
                <span>Incluir en la comparación<span className="sr-only">: {t.nombre}</span></span>
              </label>
            </li>
          ))}
        </ul>
      </fieldset>
      <Button type="submit" variant="sunset" size="lg" className="mt-4 h-11 px-4 text-base">
        Comparar temas seleccionados
      </Button>
    </form>
  );
}
