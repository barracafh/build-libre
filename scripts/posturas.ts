// Propone con IA un fichero de posturas para un tema: `bun scripts/posturas.ts <tema>`.
//
// Escribe src/datos/posturas/<tema>.propuesto.json, nunca el <tema>.json curado: la web solo lee
// el curado, así que la propuesta la revisa una persona y la copia a mano.
//
// - Primera llamada: propone 4–7 enunciados a partir de todos los títulos del tema.
// - Después, lotes de ~10 iniciativas: asigna cada una a un enunciado con su dirección.
// - Llamadas en serie y sin más reintentos que los de completar(): los límites de HelmCode son
//   compartidos con todos los equipos.
// - Necesita HELMCODE_API_KEY y HELMCODE_MODEL (Bun lee .env.local solo).

import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

import { TEMAS, votacion } from "../src/lib/datos.ts";
import type { Mensaje } from "../src/lib/ia.ts";
import { iniciativasDeTema, type Iniciativa } from "../src/lib/iniciativas.ts";
import type { Asignacion, Enunciado, FicheroPosturas, SinEnunciado } from "../src/lib/posturas.ts";

const LOTE = 10;
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
    for await (const trozo of res.body as unknown as AsyncIterable<Uint8Array>) {
      resto += decoder.decode(trozo, { stream: true });
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
const MAX_TEXTO = 600;

const REGLAS = `Reglas:
- Un enunciado es una medida concreta redactada como acción, en español, con redacción neutral: sin adjetivos ni palabras valorativas («ilegal», «abusivo», «fracaso»…). Ejemplos para vivienda: «Regular los precios del alquiler», «Ampliar el parque público de vivienda», «Endurecer la respuesta a la ocupación de viviendas».
- Si hay mociones de la oposición que censuran en bloque la política del Gobierno con muchas medidas, usa el enunciado «Respaldar la política de <tema> del Gobierno»: en esas mociones votar Sí es estar en contra (direccion -1); en los reales decretos-ley del Gobierno sobre el tema, Sí es a favor (direccion 1).
- direccion es 1 si votar Sí a la iniciativa es estar a favor de la medida del enunciado, y -1 si votar Sí es estar en contra.
- Cada asignación lleva una "nota" de una línea que explica por qué la dirección es esa.
- Si una iniciativa es de trámite, mezcla varias medidas sin una principal o no está claro qué significaba votar Sí, ponla en "sinEnunciado" con el motivo. Ante la duda, sinEnunciado: nunca adivines.
- Responde solo con JSON válido, sin texto alrededor.`;

type Ficha = {
  id: string;
  tipo: string;
  proponente: string | null;
  titulo: string;
  texto: string;
  motivos: string[];
};

function ficha(i: Iniciativa): Ficha {
  const votos = i.votaciones.map((v) => votacion(v.id)).filter((v) => v !== undefined);
  const texto = votos[0]?.texto.trim() ?? "";
  const motivos = votos
    .flatMap((v) => Object.entries(v.motivos).map(([grupo, m]) => `${grupo}: ${m.texto}`))
    .slice(0, 2);
  return {
    id: i.id,
    tipo: i.tipo,
    proponente: i.proponenteNombre,
    titulo: i.titulo,
    texto: texto.length > MAX_TEXTO ? `${texto.slice(0, MAX_TEXTO)}…` : texto,
    motivos,
  };
}

// Quita las vallas de código y lo que haya fuera del primer objeto JSON.
function leerJson(respuesta: string): unknown {
  const sinVallas = respuesta.replace(/```(?:json)?/gi, "").trim();
  const inicio = sinVallas.indexOf("{");
  const fin = sinVallas.lastIndexOf("}");
  if (inicio < 0 || fin < inicio) throw new Error(`La respuesta no trae JSON: ${respuesta.slice(0, 200)}`);
  return JSON.parse(sinVallas.slice(inicio, fin + 1));
}

const slugValido = (s: unknown): s is string => typeof s === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s);

async function proponerEnunciados(nombreTema: string, fichas: Ficha[]): Promise<Enunciado[]> {
  const mensajes: Mensaje[] = [
    {
      role: "system",
      content: `Ayudas a resumir en qué medidas concretas se dividen las votaciones del Congreso sobre «${nombreTema}».\n${REGLAS}`,
    },
    {
      role: "user",
      content: `Estas son las iniciativas del tema (id | tipo | proponente | título). Propón entre 4 y 7 enunciados que cubran las más posibles. Formato: {"enunciados":[{"slug":"kebab-case","texto":"..."}]}\n\n${fichas
        .map((f) => `${f.id} | ${f.tipo} | ${f.proponente ?? "?"} | ${f.titulo}`)
        .join("\n")}`,
    },
  ];
  const datos = leerJson(await completar(mensajes)) as { enunciados?: unknown };
  const lista = Array.isArray(datos.enunciados) ? datos.enunciados : [];
  const vistos = new Set<string>();
  const enunciados: Enunciado[] = [];
  for (const e of lista as Partial<Enunciado>[]) {
    if (!slugValido(e?.slug) || typeof e.texto !== "string" || vistos.has(e.slug)) continue;
    vistos.add(e.slug);
    enunciados.push({ slug: e.slug, texto: e.texto.trim() });
  }
  if (!enunciados.length) throw new Error("El modelo no propuso enunciados válidos");
  return enunciados;
}

async function asignarLote(
  nombreTema: string,
  enunciados: Enunciado[],
  lote: Ficha[],
): Promise<{ asignaciones: Asignacion[]; sinEnunciado: SinEnunciado[] }> {
  const mensajes: Mensaje[] = [
    {
      role: "system",
      content: `Asignas votaciones del Congreso sobre «${nombreTema}» a enunciados ya fijados.\n${REGLAS}\n\nEnunciados (usa solo estos slugs):\n${enunciados
        .map((e) => `- ${e.slug}: ${e.texto}`)
        .join("\n")}`,
    },
    {
      role: "user",
      content: `Asigna cada iniciativa a un enunciado o ponla en sinEnunciado. Todas deben aparecer exactamente una vez. Formato: {"asignaciones":[{"iniciativa":"id","enunciado":"slug","direccion":1,"nota":"..."}],"sinEnunciado":[{"iniciativa":"id","nota":"motivo"}]}\n\n${JSON.stringify(lote, null, 1)}`,
    },
  ];
  const datos = leerJson(await completar(mensajes)) as { asignaciones?: unknown; sinEnunciado?: unknown };
  const ids = new Set(lote.map((f) => f.id));
  const slugs = new Set(enunciados.map((e) => e.slug));
  const usados = new Set<string>();
  const asignaciones: Asignacion[] = [];
  const sinEnunciado: SinEnunciado[] = [];

  for (const a of (Array.isArray(datos.asignaciones) ? datos.asignaciones : []) as Partial<Asignacion>[]) {
    const id = a?.iniciativa;
    if (typeof id !== "string" || !ids.has(id) || usados.has(id)) continue;
    usados.add(id);
    const direccion = Number(a.direccion);
    if (!slugs.has(a.enunciado ?? "") || (direccion !== 1 && direccion !== -1)) {
      sinEnunciado.push({ iniciativa: id, nota: "El modelo dio un enunciado o una dirección no válidos" });
      continue;
    }
    asignaciones.push({
      iniciativa: id,
      enunciado: a.enunciado!,
      direccion: direccion as 1 | -1,
      nota: typeof a.nota === "string" ? a.nota.trim() : "",
      revisar: true,
    });
  }
  for (const s of (Array.isArray(datos.sinEnunciado) ? datos.sinEnunciado : []) as Partial<SinEnunciado>[]) {
    const id = s?.iniciativa;
    if (typeof id !== "string" || !ids.has(id) || usados.has(id)) continue;
    usados.add(id);
    sinEnunciado.push({ iniciativa: id, nota: typeof s.nota === "string" ? s.nota.trim() : "" });
  }
  for (const id of ids) if (!usados.has(id)) sinEnunciado.push({ iniciativa: id, nota: "El modelo no la asignó" });
  return { asignaciones, sinEnunciado };
}

async function main() {
  const tema = process.argv[2];
  if (!tema || !TEMAS[tema]) {
    console.error(`Uso: bun scripts/posturas.ts <tema>\nTemas: ${Object.keys(TEMAS).join(", ")}`);
    process.exit(1);
  }
  const nombreTema = TEMAS[tema];
  const fichas = iniciativasDeTema(tema).map(ficha);
  if (!fichas.length) {
    console.error(`El tema ${tema} no tiene iniciativas`);
    process.exit(1);
  }

  console.log(`${fichas.length} iniciativas en ${tema}; proponiendo enunciados…`);
  const enunciados = await proponerEnunciados(nombreTema, fichas);

  const propuesta: Required<FicheroPosturas> = { tema, enunciados, asignaciones: [], sinEnunciado: [] };
  for (let i = 0; i < fichas.length; i += LOTE) {
    console.log(`Asignando ${i + 1}–${Math.min(i + LOTE, fichas.length)}…`);
    const r = await asignarLote(nombreTema, enunciados, fichas.slice(i, i + LOTE));
    propuesta.asignaciones.push(...r.asignaciones);
    propuesta.sinEnunciado.push(...r.sinEnunciado);
  }

  const carpeta = join(process.cwd(), "src", "datos", "posturas");
  mkdirSync(carpeta, { recursive: true });
  const destino = join(carpeta, `${tema}.propuesto.json`);
  writeFileSync(destino, `${JSON.stringify(propuesta, null, 2)}\n`);
  console.log(
    `Escrito ${destino}: ${enunciados.length} enunciados, ${propuesta.asignaciones.length} asignaciones, ${propuesta.sinEnunciado.length} sin enunciado, ${llamadas} llamadas a la IA. Revísalo antes de copiarlo a ${tema}.json.`,
  );
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
