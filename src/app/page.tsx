import { CardLink } from "@/components/card-link";
import { Fuentes } from "@/components/fuentes";
import { vistas } from "@/config/vistas";

const fuentes = [
  { nombre: "Datos abiertos del Congreso de los Diputados", url: "https://www.congreso.es/es/datos-abiertos" },
  { nombre: "Escaño Abierto (reelaboración de los datos del Congreso)", url: "https://github.com/jorgegarcelan/escano-abierto" },
];

export default function Home() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-6 sm:px-6 lg:py-10">
      <div className="flex flex-col gap-3">
        <h1 className="text-[28px] leading-tight lg:text-4xl">Lo que votó cada partido en el Congreso</h1>
        <p className="text-(--text-secondary)">
          Las votaciones del Pleno en la XV legislatura, con el enlace a cada votación oficial. La
          herramienta muestra hechos; las conclusiones son tuyas.
        </p>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {vistas.map((v) => (
          <li key={v.ruta}>
            <CardLink href={v.ruta} titulo={v.nombre}>
              {v.descripcion}
            </CardLink>
          </li>
        ))}
      </ul>
      <Fuentes fuentes={fuentes} />
    </main>
  );
}
