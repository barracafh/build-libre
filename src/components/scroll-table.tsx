import type { ReactNode } from "react";

// A wide table scrolls inside its own box, never the page. Focusable so it scrolls by keyboard.
export function ScrollTable({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div
      role="region"
      aria-label={label}
      tabIndex={0}
      className="overflow-x-auto rounded-lg border bg-card"
    >
      {children}
    </div>
  );
}
