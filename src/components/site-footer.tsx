import Link from "next/link";
import { BotonAviso } from "@/components/BotonAviso";
import ficha from "../../ficha.json";

const enlace =
  "underline underline-offset-2 hover:decoration-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";

export function SiteFooter() {
  return (
    <footer className="mt-10 border-t bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 text-sm text-muted-foreground sm:px-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <p className="font-medium text-(--text-secondary)">
            Herramienta experimental. No es un servicio oficial.
          </p>
          <p>
            Datos de{" "}
            <a href="https://github.com/jorgegarcelan/escano-abierto" className={enlace}>
              Escaño Abierto
            </a>{" "}
            (CC BY 4.0), a partir de los datos abiertos del Congreso de los Diputados. Sistema
            visual Sol, de{" "}
            <a href="https://reforma-digital.es" className={enlace}>
              Reforma Digital
            </a>
            .
          </p>
          <p>
            Una pieza del squad <span className="font-mono">{ficha.equipo}</span> · Build night
          </p>
          <p>
            <Link href="/metodo" className={`inline-flex min-h-11 items-center ${enlace}`}>
              Método: de dónde salen los datos
            </Link>
          </p>
        </div>
        <div className="shrink-0">
          <BotonAviso />
        </div>
      </div>
    </footer>
  );
}
