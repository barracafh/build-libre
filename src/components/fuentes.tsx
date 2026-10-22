import { ArrowUpRight, BookOpen } from "lucide-react";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { Item, ItemContent, ItemTitle, ItemDescription, ItemActions } from "@/components/ui/item";

export type Source = { nombre: string; url: string };

const sinProtocolo = (url: string) =>
  url.replace(/^https?:\/\//, "").replace(/\/$/, "");

export function Fuentes({ fuentes }: { fuentes: readonly Source[] }) {
  return (
    <aside aria-label="Fuentes oficiales" className="text-base">
      <h3 className="font-medium">Fuentes oficiales</h3>
      {fuentes.length === 0 ? (
        <Empty className="mt-3 border">
          <EmptyHeader>
            <EmptyMedia variant="icon"><BookOpen aria-hidden="true" /></EmptyMedia>
            <EmptyTitle>Sin fuentes oficiales conectadas</EmptyTitle>
            <EmptyDescription>Aquí aparecerán los enlaces que sustentan los datos cuando estén disponibles.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="mt-3 space-y-2">
          {fuentes.map((source) => (
            <li key={source.url}>
              <Item variant="outline" render={<a href={source.url} />} className="min-h-11 flex-nowrap">
                <ItemContent className="min-w-0 [overflow-wrap:anywhere]">
                  <ItemTitle className="line-clamp-none">{source.nombre}</ItemTitle>
                  {sinProtocolo(source.url) !== source.nombre && (
                    <ItemDescription className="line-clamp-none font-mono text-sm">{sinProtocolo(source.url)}</ItemDescription>
                  )}
                </ItemContent>
                <ItemActions><ArrowUpRight aria-hidden="true" className="size-4 shrink-0" /></ItemActions>
              </Item>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
