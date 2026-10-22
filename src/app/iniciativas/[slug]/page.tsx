import { notFound, redirect } from "next/navigation";
import { TEMAS } from "@/lib/datos";

export const dynamicParams = false;

export const generateStaticParams = () => Object.keys(TEMAS).map((slug) => ({ slug }));

type Props = { params: Promise<{ slug: string }> };

export default async function Tema({ params }: Props) {
  const { slug } = await params;
  if (!Object.hasOwn(TEMAS, slug)) notFound();
  redirect(`/posturas/tema/${slug}`);
}
