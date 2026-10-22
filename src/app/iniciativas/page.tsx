import type { Metadata } from "next";

import { PaginaTema } from "@/components/tema/pagina-tema";

export const metadata: Metadata = { title: "Iniciativas votadas" };

export default function Temas() {
  return <PaginaTema slug="vivienda" />;
}
