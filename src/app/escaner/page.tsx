import type { Metadata } from "next";

import { Escaner } from "@/components/escaner/escaner";
import "@/components/escaner/escaner.css";
import { escaner } from "@/lib/datos";

export const metadata: Metadata = { title: "Escáner político" };

export default function EscanerPage() {
  return <Escaner datos={escaner()} />;
}
