import { redirect } from "next/navigation";

export default async function DetallePosicion({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const recibidos = await searchParams;
  const parametros = new URLSearchParams();
  for (const clave of ["partido", "tema"]) {
    const valor = recibidos[clave];
    const primero = Array.isArray(valor) ? valor[0] : valor;
    if (primero) parametros.set(clave, primero);
  }
  const consulta = parametros.toString();
  redirect(`/posturas/grupo${consulta ? `?${consulta}` : ""}`);
}
