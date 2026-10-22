"use client";

import { useRouter } from "next/navigation";

type Props = { actual: string; temas: { slug: string; nombre: string }[] };

// Native select: keyboard and screen readers work without extra code.
export function SelectorTema({ actual, temas }: Props) {
  const router = useRouter();
  return (
    <label className="flex max-w-sm flex-col gap-1.5 text-sm font-semibold">
      Tema
      <select
        value={actual}
        onChange={(e) => router.push(`/iniciativas/${e.target.value}`)}
        className="min-h-11 rounded-xl border bg-card px-4 text-base font-normal"
      >
        {temas.map((t) => (
          <option key={t.slug} value={t.slug}>
            {t.nombre}
          </option>
        ))}
      </select>
    </label>
  );
}
