import type { Metadata } from "next";

import { PaginaTema } from "@/components/tema/pagina-tema";
import { TEMAS } from "@/lib/datos";

export const dynamicParams = false;

export const generateStaticParams = () => Object.keys(TEMAS).map((slug) => ({ slug }));

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: TEMAS[(await params).slug] };
}

export default async function Tema({ params }: Props) {
  return <PaginaTema slug={(await params).slug} />;
}
