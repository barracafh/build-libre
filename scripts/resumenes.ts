// Genera con IA el resumen de un tema: `bun scripts/resumenes.ts <tema> [--forzar]`.
//
// Escribe src/datos/resumenes/<tema>.json, que lee src/lib/resumenes.ts. Si ya existe, no hace nada
// salvo con --forzar.
//
// - Una sola llamada. El modelo solo redacta, para hasta 5 iniciativas, QUÉ se votó y si salió
//   adelante; no recibe fechas ni grupos. Fecha, votos de cada grupo y enlace los pinta
//   src/components/resumen-tema.tsx desde los datos.
// - Cada frase se valida (problemasFrase en src/lib/resumenes.ts): exactamente un id real del tema,
//   sin grupos, años, meses ni recuentos, con «salió adelante»/«no salió adelante» igual que los
//   datos (totales.si > totales.no de la primera votación) y sin palabras vetadas. Las que no pasan
//   se descartan y se cuentan.
// - Necesita HELMCODE_API_KEY y HELMCODE_MODEL (Bun lee .env.local solo).

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { TEMAS, votacion } from "../src/lib/datos.ts";
import type { Mensaje } from "../src/lib/ia.ts";
import { iniciativasDeTema, type Iniciativa } from "../src/lib/iniciativas.ts";
import { problemasFrase, type FraseResumen } from "../src/lib/resumenes.ts";

const MAX_ENTRADA = 9000;
const MAX_INICIATIVAS = 25;
const MAX_TITULO = 220;
let llamadas = 0;

// Como completar() de src/lib/ia.ts, pero en streaming: el modelo razona antes de responder y,
// sin streaming, la pasarela corta a los ~2 minutos con un 408.
async function completar(messages: Mensaje[]): Promise<string> {
  const { HELMCODE_API_KEY, HELMCODE_BASE_URL, HELMCODE_MODEL } = process.env;
  if (!HELMCODE_API_KEY || !HELMCODE_MODEL) throw new Error("Faltan HELMCODE_API_KEY o HELMCODE_MODEL en .env.local");
  for (let intento = 0; ; intento++) {
    llamadas++;
    const res = await fetch(`${HELMCODE_BASE_URL ?? "https://api.helmcode.com/v1"}/chat/completions`, {
      method: "POST",
      headers: { authorization: `Bearer ${HELMCODE_API_KEY}`, "content-type": "application/json" },
      body: JSON.stringify({ model: HELMCODE_MODEL, messages, stream: true }),
    });
    if (res.status === 429 && intento < 3) {
      const espera = Number(res.headers.get("retry-after")) || 2 ** intento;
      await new Promise((r) => setTimeout(r, Math.min(espera, 10) * 1000));
      continue;
    }
    if (!res.ok || !res.body) throw new Error(`HelmCode respondió ${res.status}`);
    let texto = "";
    let resto = "";
    const decoder = new TextDecoder();
    const lector = res.body.getReader();
    for (;;) {
      const { done, value } = await lector.read();
      if (done) break;
      resto += decoder.decode(value, { stream: true });
      const lineas = resto.split("\n");
      resto = lineas.pop() ?? "";
      for (const l of lineas) {
        const d = l.trim();
        if (!d.startsWith("data:")) continue;
        const json = d.slice(5).trim();
        if (json === "[DONE]") continue;
        try {
          texto += JSON.parse(json).choices?.[0]?.delta?.content ?? "";
        } catch {
          // línea incompleta o de control: se ignora
        }
      }
    }
    return texto;
  }
}

const MAX_FRASES = 5;

const SISTEMA = `Redactas para una web que resume votaciones del Congreso para ciudadanos. Elige las iniciativas más significativas del tema (primero leyes, reales decretos-ley y tomas en consideración; después mociones y proposiciones no de ley) y escribe una frase por cada una, como máximo ${MAX_FRASES} frases, en castellano llano, de hechos, sin adjetivos ni valoraciones (nada de "coherente", "incumple", "rebelde", "mejor").
Cada frase dice SOLO qué se votó, explicado en palabras sencillas, y si salió adelante, usando literalmente "salió adelante" o "no salió adelante" según el dato que se da.
Prohibido en las frases: nombrar grupos o partidos (ni quién la propuso ni quién votó qué; "el Gobierno" sí se puede), fechas, meses, años, números de ley o de decreto, y recuentos de votos. Eso lo muestra la web aparte desde los datos.
Devuelve SOLO JSON: {"frases":[{"texto":"…","iniciativas":["id"]}]}. Cada frase cita exactamente una iniciativa de la lista por su id exacto, y cada iniciativa sale como mucho en una frase.`;

function salio(i: Iniciativa): boolean {
  const t = votacion(i.votaciones[0].id)?.totales;
  return !!t && t.si > t.no;
}

const corto = (s: string) => (s.length > MAX_TITULO ? `${s.slice(0, MAX_TITULO)}…` : s);

// Sin fecha, sin grupos y sin proponente (salvo el Gobierno): lo que no se le da no lo puede repetir mal.
const lineaIniciativa = (i: Iniciativa) =>
  `- id=${i.id} | ${i.tipo}${i.proponente === "GOB" ? " del Gobierno" : ""} | ${corto(i.titulo)} | ${
    salio(i) ? "salió adelante" : "no salió adelante"
  }`;

function entrada(slug: string, iniciativas: Iniciativa[]): string {
  const cabecera = `Tema: ${TEMAS[slug] ?? slug}\n\nIniciativas votadas (más reciente primero):\n`;
  const lineas = iniciativas.map(lineaIniciativa);
  let texto = cabecera + lineas.join("\n");
  if (texto.length <= MAX_ENTRADA) return texto;
  // Demasiado largo: las 25 más recientes (ya vienen ordenadas), y menos si aún no cabe.
  lineas.length = Math.min(lineas.length, MAX_INICIATIVAS);
  texto = cabecera + lineas.join("\n");
  while (texto.length > MAX_ENTRADA && lineas.length > 5) {
    lineas.pop();
    texto = cabecera + lineas.join("\n");
  }
  return texto;
}

// Quita las vallas de código y lo que haya fuera del primer objeto JSON.
function leerJson(respuesta: string): unknown {
  const sinVallas = respuesta.replace(/```(?:json)?/gi, "").trim();
  const inicio = sinVallas.indexOf("{");
  const fin = sinVallas.lastIndexOf("}");
  if (inicio < 0 || fin < inicio) throw new Error(`La respuesta no trae JSON: ${respuesta.slice(0, 200)}`);
  return JSON.parse(sinVallas.slice(inicio, fin + 1));
}

function validar(datos: unknown, porId: Map<string, Iniciativa>): { frases: FraseResumen[]; descartadas: string[] } {
  const lista = Array.isArray((datos as { frases?: unknown })?.frases) ? (datos as { frases: unknown[] }).frases : [];
  const frases: FraseResumen[] = [];
  const descartadas: string[] = [];
  const usadas = new Set<string>();
  for (const f of lista as Partial<FraseResumen>[]) {
    const texto = typeof f?.texto === "string" ? f.texto.replace(/\s+/g, " ").trim() : "";
    const inis = Array.isArray(f?.iniciativas) ? [...new Set(f.iniciativas.map((x) => String(x).trim()))] : [];
    const motivo = (m: string) => descartadas.push(`${m}: «${texto}» [${inis.join(", ")}]`);
    if (!texto) motivo("frase vacía");
    else if (inis.length !== 1) motivo(`cita ${inis.length} iniciativas, no 1`);
    else if (!porId.has(inis[0])) motivo("id que no es del tema");
    else if (usadas.has(inis[0])) motivo("iniciativa repetida");
    else if (frases.length >= MAX_FRASES) motivo(`pasa de ${MAX_FRASES} frases`);
    else {
      const problemas = problemasFrase(texto, salio(porId.get(inis[0])!));
      if (problemas.length) motivo(problemas.join("; "));
      else {
        usadas.add(inis[0]);
        frases.push({ texto, iniciativas: inis });
      }
    }
  }
  return { frases, descartadas };
}

async function main() {
  const args = process.argv.slice(2);
  const slug = args.find((a) => !a.startsWith("--"));
  const forzar = args.includes("--forzar");
  if (!slug) throw new Error("Uso: bun scripts/resumenes.ts <tema> [--forzar]");
  const iniciativas = iniciativasDeTema(slug);
  if (!iniciativas.length) throw new Error(`El tema «${slug}» no tiene iniciativas`);

  const carpeta = join(process.cwd(), "src", "datos", "resumenes");
  const fichero = join(carpeta, `${slug}.json`);
  if (existsSync(fichero) && !forzar) {
    console.log(`${fichero} ya existe; usa --forzar para regenerarlo.`);
    return;
  }

  const texto = entrada(slug, iniciativas);
  console.log(`Entrada: ${texto.length} caracteres, ${iniciativas.length} iniciativas en el tema.`);
  const respuesta = await completar([
    { role: "system", content: SISTEMA },
    { role: "user", content: texto },
  ]);
  const { frases, descartadas } = validar(leerJson(respuesta), new Map(iniciativas.map((i) => [i.id, i])));
  for (const d of descartadas) console.warn(`Descartada: ${d}`);
  if (!frases.length) throw new Error("Ninguna frase pasó la validación; no se escribe nada.");

  mkdirSync(carpeta, { recursive: true });
  const salida = {
    tema: slug,
    generado: new Date().toISOString(),
    modelo: process.env.HELMCODE_MODEL ?? "",
    frases,
    descartadas: descartadas.length,
  };
  writeFileSync(fichero, `${JSON.stringify(salida, null, 2)}\n`);
  console.log(`Escrito ${fichero}: ${frases.length} frases, ${descartadas.length} descartadas, ${llamadas} llamadas.`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
