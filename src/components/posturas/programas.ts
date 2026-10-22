// The 2023 general election programmes served from our own site (public/programas/2023/), so every
// promise can be checked here even if the party's URL dies. Server only: reads src/datos at import.

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { ruta } from "@/config/sitio";
import { partidos } from "@/lib/datos";

export type Programa = {
  sigla: string;
  partido: string;
  archivo: string; // URL of our copy
  fuente: string; // the party's original URL
  paginas: number;
  idioma: "es" | "ca";
};

// Parties without a parliamentary group of their own in partidos.json.
const NOMBRES_PROPIOS: Record<string, string> = {
  UPN: "Unión del Pueblo Navarro",
  BNG: "Bloque Nacionalista Galego",
};
const EN_CATALAN = new Set(["ERC", "JUNTS"]);

export function urlPrograma(sigla: string, pagina?: number): string {
  const url = ruta(`/programas/2023/${sigla.toLowerCase()}.pdf`);
  return pagina ? `${url}#page=${pagina}` : url;
}

function leerProgramas(): Programa[] {
  const dir = join(process.cwd(), "src", "datos", "programas", "2023");
  const nombres = new Map(partidos().map((p) => [p.codigo, p.nombre]));
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      // Parse, keep the three fields, drop the page texts.
      const { sigla, fuente, paginas } = JSON.parse(readFileSync(join(dir, f), "utf8")) as {
        sigla: string;
        fuente: string;
        paginas: string[];
      };
      return {
        sigla,
        partido: NOMBRES_PROPIOS[sigla] ?? nombres.get(sigla) ?? sigla,
        archivo: urlPrograma(sigla),
        fuente,
        paginas: paginas.length,
        idioma: EN_CATALAN.has(sigla) ? ("ca" as const) : ("es" as const),
      };
    })
    .sort((a, b) => a.partido.localeCompare(b.partido, "es"));
}

// Alphabetical by party name.
export const PROGRAMAS: Programa[] = leerProgramas();
