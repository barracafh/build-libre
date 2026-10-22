"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import ficha from "../../ficha.json";

// Sections of the site. `dentro` lists the path prefixes of the pages that live inside a section,
// which get aria-current="true" (the section's own page gets "page").
const SECCIONES = [
  { href: "/", nombre: "Temas", dentro: ["/tema/"] },
  { href: "/programas", nombre: "Programas", dentro: ["/programas/"] },
  { href: "/metodo", nombre: "Método", dentro: ["/metodo/"] },
] as const;

type Actual = "page" | "true" | undefined;

function actual(pathname: string, s: (typeof SECCIONES)[number]): Actual {
  if (pathname === s.href) return "page";
  if (s.dentro.some((p) => pathname.startsWith(p))) return "true";
  return undefined;
}

const datos = ficha.datos === "reales" ? "Datos públicos" : "Datos simulados";

export function SiteHeader() {
  const pathname = usePathname() ?? "/";
  const menu = useRef<HTMLDetailsElement>(null);

  // Close the phone menu after navigating.
  useEffect(() => {
    if (menu.current) menu.current.open = false;
  }, [pathname]);

  // With JavaScript: close on Escape (focus back to «Menú»), on a click outside and when focus
  // leaves the menu. Without it the native <details> still opens and closes.
  useEffect(() => {
    const el = menu.current;
    if (!el) return;
    const cerrar = () => {
      el.open = false;
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && el.open) {
        cerrar();
        el.querySelector("summary")?.focus();
      }
    };
    const onPointer = (e: PointerEvent) => {
      if (el.open && !el.contains(e.target as Node)) cerrar();
    };
    const onFocusOut = (e: FocusEvent) => {
      const destino = e.relatedTarget as Node | null;
      if (el.open && destino && !el.contains(destino)) cerrar();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    el.addEventListener("focusout", onFocusOut);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
      el.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  return (
    <header className="relative border-b bg-background">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 sm:px-6 lg:gap-8">
        <Link
          href="/"
          className="inline-flex min-h-11 min-w-0 items-center gap-3 rounded-lg leading-tight font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
        >
          <span
            aria-hidden="true"
            className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand font-mono text-lg text-white"
          >
            {ficha.icono}
          </span>
          <span className="min-w-0">{ficha.nombre}</span>
        </Link>

        <nav aria-label="Secciones" className="hidden h-full lg:block">
          <ul className="flex h-full">
            {SECCIONES.map((s) => {
              const a = actual(pathname, s);
              return (
                <li key={s.href} className="h-full">
                  <Link
                    href={s.href}
                    aria-current={a}
                    className={cn(
                      "relative flex h-full items-center px-3 text-sm transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-foreground",
                      a &&
                        "bg-muted font-semibold after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:bg-foreground",
                    )}
                  >
                    {s.nombre}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-3">
          <Badge variant="outline" className="hidden sm:inline-flex">
            {datos}
          </Badge>

          <details ref={menu} name="site-header" className="site-menu group lg:hidden">
            <summary
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-11 cursor-pointer list-none gap-2 px-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground [&::-webkit-details-marker]:hidden",
              )}
            >
              <span aria-hidden="true" className="grid w-4 gap-[3px]">
                <span className="h-0.5 rounded-full bg-current" />
                <span className="h-0.5 rounded-full bg-current" />
                <span className="h-0.5 rounded-full bg-current" />
              </span>
              Menú
              {/* The scrim belongs to the summary, so tapping it closes the menu without JS. */}
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-full z-30 h-dvh hidden cursor-default bg-foreground/30 group-open:block"
              />
            </summary>
            <nav
              aria-label="Secciones"
              className="absolute inset-x-0 top-full z-40 border-b bg-background shadow-(--shadow-overlay)"
            >
              <ul className="py-2">
                {SECCIONES.map((s) => {
                  const a = actual(pathname, s);
                  return (
                    <li key={s.href}>
                      <Link
                        href={s.href}
                        aria-current={a}
                        className={cn(
                          "flex min-h-12 items-center border-l-4 border-transparent px-4 text-base hover:bg-muted focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-foreground",
                          a && "border-foreground bg-muted font-semibold",
                        )}
                      >
                        {s.nombre}
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <p className="border-t px-4 py-3 sm:hidden">
                <Badge variant="outline">{datos}</Badge>
              </p>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
