import Link from "next/link";
import type { ReactNode } from "react";

export default function PosturasLayout({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-10">
      {children}
      <nav aria-label="Información de Posturas" className="mt-10 flex flex-wrap gap-x-6 border-t pt-4">
        <Link href="/posturas" className="inline-flex min-h-11 items-center underline underline-offset-2">
          Todos los temas
        </Link>
        <Link href="/posturas/programas" className="inline-flex min-h-11 items-center underline underline-offset-2">
          Programas de 2023
        </Link>
        <Link href="/posturas/metodo" className="inline-flex min-h-11 items-center underline underline-offset-2">
          Método y fuentes
        </Link>
      </nav>
    </main>
  );
}
