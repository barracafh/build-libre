import Link from "next/link";
import type { ReactNode } from "react";

// A whole card that is one link (DESIGN.md · Card link).
export function CardLink({ href, titulo, children }: { href: string; titulo: string; children?: ReactNode }) {
  return (
    <Link
      href={href}
      className="flex min-h-11 items-center justify-between gap-4 rounded-xl border bg-card px-5 py-4 transition-colors hover:border-(--muted-foreground) focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <span className="flex min-w-0 flex-col gap-1">
        <span className="font-semibold">{titulo}</span>
        {children && <span className="text-sm text-muted-foreground">{children}</span>}
      </span>
      <span aria-hidden="true" className="text-muted-foreground">
        ›
      </span>
    </Link>
  );
}
