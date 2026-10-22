"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { vistas } from "@/config/vistas";

// ponytail: one scrolling row at every width; switch to the «Menú» <details> of DESIGN.md
// when the views no longer fit on a phone.
export function SiteNav() {
  const ruta = usePathname();
  return (
    <nav aria-label="Secciones" className="-mx-1 flex min-w-0 overflow-x-auto">
      {vistas.map((v) => {
        const actual = ruta === v.ruta ? "page" : ruta.startsWith(`${v.ruta}/`) ? "true" : undefined;
        return (
          <Link
            key={v.ruta}
            href={v.ruta}
            aria-current={actual}
            className={cn(
              "inline-flex min-h-11 items-center px-3 text-[15px] whitespace-nowrap hover:bg-muted",
              actual && "bg-muted font-semibold shadow-[inset_0_-3px_0_var(--foreground)]",
            )}
          >
            {v.nombre}
          </Link>
        );
      })}
    </nav>
  );
}
