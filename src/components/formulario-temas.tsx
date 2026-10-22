import { Button } from "@/components/ui/button";
import { temas } from "@/lib/cuestiones";
import { ruta } from "@/config/sitio";

// Tema picker, not an opinion quiz: it only chooses which temas to show, for every group alike.
export function FormularioTemas({ seleccionados = [] }: { seleccionados?: string[] }) {
  const marcados = new Set(seleccionados);
  return (
    <form method="get" action={ruta("/comparar")} className="mt-3">
      <fieldset>
        <legend className="text-base text-(--text-secondary)">
          Elige uno o varios temas. Verás, para cada grupo, qué ha votado a favor y en contra y
          qué ha defendido en el pleno.
        </legend>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {temas().map((t) => (
            <li key={t.slug}>
              <label className="flex h-full min-h-11 cursor-pointer items-center gap-3 rounded-xl bg-card px-4 py-3 text-base ring-1 ring-foreground/10 hover:ring-muted-foreground has-checked:ring-2 has-checked:ring-foreground has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-foreground">
                <input
                  type="checkbox"
                  name="temas"
                  value={t.slug}
                  defaultChecked={marcados.has(t.slug)}
                  className="size-5 shrink-0 accent-foreground focus-visible:outline-none"
                />
                <span className="min-w-0 font-medium">{t.nombre}</span>
              </label>
            </li>
          ))}
        </ul>
      </fieldset>
      <Button type="submit" variant="sunset" size="lg" className="mt-4 h-11 px-4 text-base">
        Ver qué ha hecho cada grupo
      </Button>
    </form>
  );
}
