import { BotonAviso } from "@/components/boton-aviso";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-4 py-8 text-sm text-muted-foreground sm:px-6">
        <div className="flex max-w-[60ch] flex-col gap-2">
          <p>Herramienta experimental. No es un servicio oficial.</p>
          <p>
            Datos de{" "}
            <a className="underline" href="https://github.com/jorgegarcelan/escano-abierto">
              Escaño Abierto
            </a>{" "}
            (CC BY 4.0), a partir de los datos abiertos del Congreso. Proyecto de referencia:{" "}
            <a className="underline" href="https://github.com/samuelcorsan/reforma-digital">
              Reforma Digital
            </a>
            .
          </p>
        </div>
        <BotonAviso />
      </div>
    </footer>
  );
}
