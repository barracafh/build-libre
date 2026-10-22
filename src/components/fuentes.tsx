import { ExternalLink } from "lucide-react";

export type Source = { nombre: string; url: string };

const sinProtocolo = (url: string) =>
  url.replace(/^https?:\/\//, "").replace(/\/$/, "");

export function Fuentes({ fuentes }: { fuentes: readonly Source[] }) {
  return (
    <aside aria-label="Fuentes oficiales" className="text-base">
      <h3 className="text-sm font-medium text-(--text-secondary)">
        Fuentes oficiales
      </h3>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {fuentes.map((source) => (
          <li key={source.url}>
            <a
              href={source.url}
              className="group flex h-full min-h-11 items-start justify-between gap-4 rounded-xl border bg-card px-5 py-4 transition-colors hover:border-(--muted-foreground) hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              <span className="flex min-w-0 flex-col gap-1 [overflow-wrap:anywhere]">
                <span className="font-semibold">{source.nombre}</span>
                {sinProtocolo(source.url) !== source.nombre && (
                  <span className="font-mono text-sm text-(--text-secondary)">
                    {sinProtocolo(source.url)}
                  </span>
                )}
              </span>
              <ExternalLink
                aria-hidden="true"
                className="mt-1 size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
              />
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
