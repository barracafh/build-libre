import ficha from "../../ficha.json";
import { BotonAviso } from "@/components/BotonAviso";
import { Badge } from "@/components/ui/badge";
import { PanelEstadisticas } from "@/components/estadisticas/PanelEstadisticas";

export default function Home() {
  return (
    <div className="mx-auto flex min-h-[calc(100svh-40px)] max-w-(--container-content) flex-col px-(--page-gutter)">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b py-6">
        <span className="inline-flex items-center gap-3 text-lg font-semibold">
          <span aria-hidden="true" className="grid size-9 place-items-center rounded-lg bg-brand font-mono text-xl text-white">{ficha.icono}</span>
          {ficha.nombre}
        </span>
        <Badge variant="outline">Prototipo · Datos simulados</Badge>
      </header>
      <main id="contenido" tabIndex={-1} className="min-w-0 flex-1 pt-10 pb-16 outline-none md:pt-14">
        <p className="font-mono text-xs tracking-wider text-(--text-secondary) uppercase">Panel de información</p>
        <h1 className="mt-3 text-4xl leading-tight md:text-5xl">Los datos, de un vistazo.</h1>
        <p className="mt-4 max-w-2xl text-lg text-(--text-secondary)">Consulta los indicadores, su evolución y el detalle en un mismo lugar.</p>
        <PanelEstadisticas />
      </main>
      <footer className="flex flex-wrap items-center justify-between gap-6 border-t py-6">
        <p className="font-mono text-xs tracking-wider text-(--text-secondary) uppercase">Squad {ficha.equipo} · Build night</p>
        <BotonAviso />
      </footer>
    </div>
  );
}
