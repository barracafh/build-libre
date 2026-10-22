import type { Metadata } from "next";
import { Fuentes } from "@/components/Fuentes";
import { FUENTES, instantanea, votaciones } from "@/lib/datos";

export const metadata: Metadata = {
  title: "Método",
  description: "De dónde salen los datos y cómo se calculan las posiciones de cada grupo.",
};

const fechaLarga = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const fecha = (iso: string) => fechaLarga.format(new Date(`${iso}T00:00:00Z`));
const numero = new Intl.NumberFormat("es-ES", { useGrouping: "always" });

const enlace =
  "underline underline-offset-2 hover:decoration-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";

const DATOS_ABIERTOS = "https://www.congreso.es/es/datos-abiertos";

export default function Metodo() {
  const { commit, fecha: descarga, ultimaVotacion } = instantanea();
  const todas = votaciones();
  const primera = todas[0]?.fecha;

  return (
    <article className="max-w-[72ch] text-base">
      <h1 className="text-[28px] leading-tight lg:text-[36px]">Método</h1>
      <p className="mt-3 text-(--text-secondary)">
        Qué datos usa esta herramienta, de dónde vienen y qué hacemos con ellos.
      </p>

      <section aria-labelledby="origen" className="mt-8">
        <h2 id="origen" className="text-xl lg:text-2xl">
          De dónde salen los datos
        </h2>
        <p className="mt-2">
          Las votaciones del Pleno vienen de{" "}
          <a href={FUENTES.escanoAbierto} className={enlace}>
            Escaño Abierto
          </a>{" "}
          (datos con licencia CC BY 4.0), que las construye a partir de los{" "}
          <a href={DATOS_ABIERTOS} className={enlace}>
            datos abiertos del Congreso de los Diputados
          </a>
          . Usamos una copia fija de su repositorio, la del commit{" "}
          <a href={`${FUENTES.escanoAbierto}/tree/${commit}`} className={`font-mono text-sm ${enlace}`}>
            {commit.slice(0, 7)}
          </a>
          , descargada el {fecha(descarga)}. Cada votación enlaza su registro oficial en congreso.es.
        </p>
      </section>

      <section aria-labelledby="periodo" className="mt-8">
        <h2 id="periodo" className="text-xl lg:text-2xl">
          Periodo
        </h2>
        <p className="mt-2">
          XV legislatura: {numero.format(todas.length)} votaciones del Pleno
          {primera && ultimaVotacion && (
            <>
              , del {fecha(primera)} al {fecha(ultimaVotacion)}
            </>
          )}
          . Las votaciones posteriores a la copia no aparecen.
        </p>
      </section>

      <section aria-labelledby="dividido" className="mt-8">
        <h2 id="dividido" className="text-xl lg:text-2xl">
          Posición de cada grupo y «Dividido»
        </h2>
        <p className="mt-2">
          La posición de un grupo es la opción (Sí, No o Abstención) que reúne al menos el 80 % de
          los votos emitidos por sus diputados. Si ninguna llega a ese 80 %, el grupo figura como
          «Dividido». Si ninguno de sus diputados votó, figura como «No vota». Es la misma regla que
          usa Escaño Abierto.
        </p>
        <p className="mt-2">
          El Grupo Mixto no se muestra como un grupo: reúne a diputados de formaciones distintas y no
          tiene una posición común. Los grupos aparecen siempre en orden alfabético, nunca ordenados
          por su voto.
        </p>
      </section>

      <section aria-labelledby="cuestiones" className="mt-8">
        <h2 id="cuestiones" className="text-xl lg:text-2xl">
          Temas y cuestiones
        </h2>
        <p className="mt-2">
          Los temas de cada votación los asigna Escaño Abierto por palabras clave. Las cuestiones
          son reglas de palabras clave que mantenemos en{" "}
          <span className="font-mono text-sm">src/datos/cuestiones.json</span>. En ninguno de los
          dos casos interviene inteligencia artificial.
        </p>
      </section>

      <section aria-labelledby="resumenes" className="mt-8">
        <h2 id="resumenes" className="text-xl lg:text-2xl">
          Resúmenes del debate
        </h2>
        <p className="mt-2">
          Lo que dijo cada grupo en el debate es un resumen generado por un modelo de lenguaje en
          Escaño Abierto a partir del Diario de Sesiones. Se muestra señalado como tal, junto al
          nombre de quien habló y el enlace a la transcripción oficial, y nunca se usa para filtrar
          ni clasificar votaciones. Si un grupo no tiene resumen, figura «Sin intervención
          registrada».
        </p>
      </section>

      <div className="mt-10">
        <Fuentes
          fuentes={[
            { nombre: "Datos abiertos del Congreso de los Diputados", url: DATOS_ABIERTOS },
          ]}
        />
      </div>
    </article>
  );
}
