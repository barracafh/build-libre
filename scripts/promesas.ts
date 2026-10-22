// Promesas de los programas del 23J con HelmCode. Port de reforma-digital apps/ingestion/escano/promesas.py
// (mismos prompts, mismo corte en unidades, mismos ids SIGLA-PPP-NNNN y misma clave de caché).
//
//   bun scripts/promesas.ts texto [carpeta-pdfs]            PDFs -> src/datos/programas/2023/<SIGLA>.json (sin IA)
//   bun scripts/promesas.ts promesas <SIGLA> [tema]         unidades -> src/datos/promesas/<SIGLA>.json
//   bun scripts/promesas.ts juicio <SIGLA> <tema>           promesas -> src/datos/promesas/juicios/<SIGLA>-<tema>.json
//   --limite N   máximo de llamadas a la IA en esta ejecución (20 por defecto); las respuestas en caché no cuentan.
//
// Diferencias con upstream:
// - Texto: pdftotext (como upstream) si está en el PATH; si no, unpdf (pdf.js) reconstruyendo las líneas por su
//   posición. Con unpdf el texto no es idéntico al de pdftotext, así que los ids de unidad pueden no coincidir
//   con los de la caché de upstream. El JSON guarda qué extractor se usó.
// - `promesas <SIGLA> <tema>`: para gastar menos, solo se mandan las unidades que contienen alguna palabra clave
//   de ese tema en data/normalizacion/temas.json. Los ids siguen contándose sobre el documento entero, pero las
//   tandas son otras, así que su caché no coincide con la de una ejecución sin tema. Se guardan todas las
//   promesas que devuelva el modelo, sean del tema que sean.
// - El modelo no recibe `response_format`: el esquema va en el mensaje y la respuesta se lee con tolerancia.
// - Juicio: los candidatos son las iniciativas del tema (iniciativasDeTema), no todas; el barajado es
//   determinista por id de promesa pero no el mismo que el de Python. El fichero guarda el id de la promesa
//   junto a sus relaciones (upstream no lo hacía).
// - Las llamadas son secuenciales (los límites de HelmCode son compartidos).

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { completar } from "../src/lib/ia.ts";
import { TEMAS, votacion } from "../src/lib/datos.ts";
import { iniciativasDeTema, type Iniciativa } from "../src/lib/iniciativas.ts";
import {
  PROGRAMAS,
  Buscador,
  anonimo,
  barajar,
  citaLiteral,
  limpiarPaginas,
  norm,
  tandas,
  unidades,
  type PromesaModelo,
  type Relacion,
  type TipoRelacion,
  type Unidad,
} from "../src/lib/promesas.ts";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const PDFS_POR_DEFECTO = "/tmp/claude-1000/-workspaces-build-libre/8fdbdc89-d435-4e0d-b06c-081e69403244/scratchpad/pdfs";
const PROGRAMAS_DIR = join(RAIZ, "src", "datos", "programas", "2023");
const PROMESAS_DIR = join(RAIZ, "src", "datos", "promesas");
const CACHE = join(PROMESAS_DIR, "cache");
const JUICIOS = join(PROMESAS_DIR, "juicios");

const VERSION = "promesas-v1";
const MODELO = () => process.env.HELMCODE_MODEL ?? "glm5.3-flash";

const log = (...xs: unknown[]) => console.error(...xs);

// ---------- prompts (literales de upstream) ----------

const SISTEMA = `Analizas programas electorales españoles para una web neutral de transparencia sobre el Congreso de los
Diputados. Aplicas las mismas reglas a todos los partidos, sin valorar ni opinar. Respondes solo con el JSON pedido.
Las citas que devuelves deben ser copia literal del texto que se te da.`;

const PROMPT_PROMESAS = `Estas son unidades de texto consecutivas del programa electoral de una candidatura a las elecciones
generales de 2023 (cada una con su id). Devuelve SOLO las que sean promesas verificables.

Una unidad es promesa si cumple las tres condiciones:
1. Es un compromiso de futuro del partido o de su futuro gobierno («aprobaremos», «crearemos», «derogaremos», «el
   salario mínimo será…», o la medida en infinitivo dentro de una lista de propuestas).
2. Tiene un objeto identificable: una norma (ley, artículo, impuesto, prestación, organismo), una cifra o un plazo,
   o un cambio de situación comprobable.
3. Se puede comprobar con hechos públicos si ha ocurrido o no.

No son promesas: diagnósticos, críticas, declaraciones de valores, y verbos sin instrumento concreto («fomentar»,
«apostar por», «promover», «impulsar», «mejorar», «reforzar», «estudiar», «avanzar hacia»), salvo que nombren el
instrumento («impulsaremos una ley de X» sí es promesa). Si una unidad contiene varias promesas, elige la principal.

Para cada promesa:
- cita: el fragmento literal de la unidad que contiene la promesa (copiado tal cual, 8 a 60 palabras).
- resumen: la promesa en castellano neutro, en 25 palabras como máximo, sin adjetivos valorativos.
- objeto: qué norma, cifra o cosa cambia, en castellano, 3 a 10 palabras.
- tipo: legislativa (necesita una ley o reforma), presupuestaria, ejecutiva (la decide el Gobierno), resultado
  (un objetivo medible), posicion (postura ante un asunto) o ue_internacional.
- direccion: crear_ampliar, reducir_suprimir, derogar o mantener.
- competencia: directa (necesita ley, reforma constitucional, presupuestos, convalidación de decreto-ley o un acto
  del Congreso), indirecta (la decide el Gobierno, pero el Congreso puede pedírsela) o ninguna (comunidades
  autónomas, ayuntamientos, UE o vida interna del partido).
- verificabilidad: alta, media o baja.
- tema: uno de {temas} u «otro».

Unidades:
{unidades}`;

const PROMPT_JUICIO = `Una promesa electoral y una lista de iniciativas votadas en el Pleno del Congreso entre 2023 y 2026.
Los nombres de partidos y grupos se han sustituido por [GRUPO]. Para cada iniciativa, di qué relación tiene con la
promesa, atendiendo solo a su contenido:
- cumple: aprobarla haría lo que la promesa dice (total o en lo esencial).
- avanza: va en la misma dirección, pero solo en parte.
- contradice: aprobarla iría en la dirección contraria a la promesa.
- relacionada: trata del mismo asunto, pero ni la cumple ni la contradice.
- no_relacionada: trata de otra cosa.
Sé estricto: cumple o contradice solo cuando la relación sea clara a partir del texto. Explica cada relación que no
sea no_relacionada en 20 palabras como máximo.

Promesa: {promesa}
Objeto: {objeto}

Iniciativas:
{actos}`;

const ESQ_PROMESAS = {
  type: "object",
  properties: {
    promesas: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          cita: { type: "string" },
          resumen: { type: "string" },
          objeto: { type: "string" },
          tipo: { type: "string", enum: ["legislativa", "presupuestaria", "ejecutiva", "resultado", "posicion", "ue_internacional"] },
          direccion: { type: "string", enum: ["crear_ampliar", "reducir_suprimir", "derogar", "mantener"] },
          competencia: { type: "string", enum: ["directa", "indirecta", "ninguna"] },
          verificabilidad: { type: "string", enum: ["alta", "media", "baja"] },
          tema: { type: "string" },
        },
        required: ["id", "cita", "resumen", "objeto", "tipo", "direccion", "competencia", "verificabilidad", "tema"],
      },
    },
  },
  required: ["promesas"],
};

const ESQ_JUICIO = {
  type: "object",
  properties: {
    relaciones: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          relacion: { type: "string", enum: ["cumple", "avanza", "contradice", "relacionada", "no_relacionada"] },
          motivo: { type: "string" },
        },
        required: ["id", "relacion"],
      },
    },
  },
  required: ["relaciones"],
};

const formato = (plantilla: string, valores: Record<string, string>) =>
  plantilla.replace(/\{(\w+)\}/g, (m, k: string) => valores[k] ?? m);

// ---------- IA con caché y límite ----------

let llamadas = 0;
let limite = 20;

class LimiteAlcanzado extends Error {}

const json = (ruta: string) => JSON.parse(readFileSync(ruta, "utf8"));

function escribir(ruta: string, datos: unknown) {
  mkdirSync(dirname(ruta), { recursive: true });
  const tmp = `${ruta}.tmp`;
  writeFileSync(tmp, JSON.stringify(datos, null, 2) + "\n");
  renameSync(tmp, ruta);
}

// La respuesta del modelo como objeto: sin vallas de código ni texto alrededor.
function leerRespuesta(texto: string): Record<string, unknown> {
  const sin = texto.replace(/```(?:json)?/gi, "");
  const a = sin.indexOf("{");
  const z = sin.lastIndexOf("}");
  if (a < 0 || z <= a) throw new Error("la respuesta no trae un objeto JSON");
  return JSON.parse(sin.slice(a, z + 1));
}

const rutaCache = (clave: string) =>
  join(CACHE, `${createHash("sha1").update(MODELO() + VERSION + clave).digest("hex")}.json`);

async function conCache(clave: string, mensaje: string, esquema: object): Promise<Record<string, unknown> | null> {
  const ruta = rutaCache(clave);
  if (existsSync(ruta)) return json(ruta);
  if (llamadas >= limite) throw new LimiteAlcanzado();
  llamadas++;
  const instruccion = `Responde solo con un objeto JSON válido que siga este esquema, sin texto antes ni después y sin bloques de código:\n${JSON.stringify(esquema)}`;
  try {
    const texto = await completar([
      { role: "system", content: SISTEMA },
      { role: "user", content: `${mensaje}\n\n${instruccion}` },
    ]);
    const datos = leerRespuesta(texto);
    escribir(ruta, datos);
    return datos;
  } catch (e) {
    log(`  error en la llamada ${llamadas}: ${(e as Error).message}`);
    return null;
  }
}

// ---------- 1. texto ----------

function hayPdftotext() {
  return spawnSync("pdftotext", ["-v"], { stdio: "ignore" }).error === undefined;
}

// Como upstream: `pdftotext -enc UTF-8 pdf -`, páginas separadas por \f (la última, vacía, se cuenta para el umbral).
function paginasPdftotext(pdf: string): string[] {
  const r = spawnSync("pdftotext", ["-enc", "UTF-8", pdf, "-"], { maxBuffer: 1 << 28 });
  if (r.status !== 0) throw new Error(`pdftotext falló con ${pdf}`);
  return r.stdout.toString("utf8").split("\f");
}

type Item = { str: string; transform: number[]; width: number; height: number; hasEOL: boolean };

// pdf.js da trozos de texto con posición; se rehacen las líneas y se deja una línea en blanco entre párrafos
// (salto vertical mayor que 1,3 veces el interlineado habitual de la página, o vuelta hacia arriba: otra
// columna o caja).
async function paginasUnpdf(pdf: string): Promise<string[]> {
  const { getDocumentProxy } = await import("unpdf");
  const doc = await getDocumentProxy(new Uint8Array(readFileSync(pdf)));
  const out: string[] = [];
  for (let n = 1; n <= doc.numPages; n++) {
    const page = await doc.getPage(n);
    const items = (await page.getTextContent()).items as Item[];
    type Linea = { texto: string; y: number; h: number };
    const lineas: Linea[] = [];
    let actual: Linea | null = null;
    let finX = 0;
    const cerrar = () => {
      if (actual && actual.texto.trim()) lineas.push(actual);
      actual = null;
    };
    for (const it of items) {
      const x = it.transform[4];
      const y = it.transform[5];
      const h = Math.abs(it.height) || Math.abs(it.transform[3]) || 10;
      if (it.str) {
        if (actual && Math.abs(actual.y - y) > 0.5 * Math.max(h, actual.h)) cerrar();
        if (!actual) actual = { texto: it.str, y, h };
        else {
          const hueco = x - finX > 0.15 * h && !/\s$/.test(actual.texto) && !/^\s/.test(it.str);
          actual.texto += (hueco ? " " : "") + it.str;
          actual.h = Math.max(actual.h, h);
        }
        finX = x + it.width;
      }
      if (it.hasEOL) cerrar();
    }
    cerrar();
    // Interlineado habitual de la página: la mediana de los saltos hacia abajo entre líneas seguidas.
    const saltos = lineas
      .slice(1)
      .map((l, i) => lineas[i].y - l.y)
      .filter((s) => s > 0)
      .sort((x, y) => x - y);
    const interlineado = saltos[Math.floor(saltos.length / 2)] ?? 0;
    const texto: string[] = [];
    lineas.forEach((l, i) => {
      const prev = lineas[i - 1];
      if (prev) {
        const salto = prev.y - l.y;
        const h = Math.max(l.h, prev.h);
        if (salto > Math.max(1.3 * interlineado, 0.9 * h) + 0.5 || salto < -0.5 * l.h) texto.push("");
      }
      texto.push(l.texto.replace(/\s+/g, " ").trim());
    });
    out.push(texto.join("\n"));
    page.cleanup();
  }
  await doc.cleanup();
  return out;
}

async function texto(carpeta: string) {
  const usarPdftotext = hayPdftotext();
  const extractor = usarPdftotext ? "pdftotext" : "unpdf";
  log(`extractor: ${extractor}`);
  const ficheros = new Set(readdirSync(carpeta));
  for (const [sigla, prog] of Object.entries(PROGRAMAS)) {
    if (!ficheros.has(prog.pdf)) {
      log(`  ${sigla}: falta ${prog.pdf}, se salta`);
      continue;
    }
    const ruta = join(carpeta, prog.pdf);
    const crudas = usarPdftotext ? paginasPdftotext(ruta) : await paginasUnpdf(ruta);
    let paginas = limpiarPaginas(crudas);
    // pdftotext acaba en \f: la última «página» vacía solo cuenta para el umbral de líneas repetidas.
    if (usarPdftotext && paginas.length && crudas.at(-1) === "") paginas = paginas.slice(0, -1);
    escribir(join(PROGRAMAS_DIR, `${sigla}.json`), { sigla, fuente: prog.url, extractor, paginas });
    log(`  ${sigla}: ${paginas.length} páginas, ${unidades(paginas, sigla).length} unidades`);
  }
}

// ---------- 2. promesas ----------

function programa(sigla: string): string[] {
  const ruta = join(PROGRAMAS_DIR, `${sigla}.json`);
  if (!existsSync(ruta)) throw new Error(`Falta ${ruta}: ejecuta antes \`bun scripts/promesas.ts texto\``);
  return json(ruta).paginas;
}

// Palabras clave de un tema (data/normalizacion/temas.json: clave -> [etiqueta, tema]).
function filtroTema(tema: string): (u: Unidad) => boolean {
  const claves = Object.entries(json(join(RAIZ, "data", "normalizacion", "temas.json")) as Record<string, [string, string]>)
    .filter(([, [, t]]) => t === tema)
    .map(([k]) => norm(k).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .sort((a, b) => b.length - a.length);
  if (!claves.length) throw new Error(`No hay palabras clave para el tema ${tema}`);
  const re = new RegExp(`(?<![\\p{L}\\p{N}])(?:${claves.join("|")})(?![\\p{L}\\p{N}])`, "u");
  return (u) => re.test(norm(u.texto));
}

async function promesas(sigla: string, tema?: string) {
  const us = unidades(programa(sigla), sigla);
  const porId = new Map(us.map((u) => [u.id, u]));
  const elegidas = tema ? us.filter(filtroTema(tema)) : us;
  const lotes = tandas(elegidas);
  const temas = Object.keys(TEMAS).join(", ");
  log(`${sigla}${tema ? ` (${tema})` : ""}: ${elegidas.length} de ${us.length} unidades en ${lotes.length} tandas`);

  const nuevas: PromesaModelo[] = [];
  let hechas = 0;
  let descartadas = 0;
  try {
    for (const lote of lotes) {
      const textoLote = lote.map((u) => `[${u.id}] ${u.texto}`).join("\n");
      const r = await conCache("promesas\x1f" + textoLote, formato(PROMPT_PROMESAS, { temas, unidades: textoLote }), ESQ_PROMESAS);
      hechas++;
      log(`  tanda ${hechas}/${lotes.length} (${llamadas} llamadas)`);
      for (const p of ((r?.promesas ?? []) as PromesaModelo[])) {
        const u = porId.get(p?.id);
        if (!u || typeof p.cita !== "string" || !citaLiteral(p.cita, u.texto)) {
          descartadas++;
          continue;
        }
        nuevas.push({
          id: p.id,
          cita: p.cita,
          resumen: p.resumen,
          objeto: p.objeto,
          tipo: p.tipo,
          direccion: p.direccion,
          competencia: p.competencia,
          verificabilidad: p.verificabilidad,
          tema: p.tema in TEMAS ? p.tema : "otro",
        });
      }
    }
  } catch (e) {
    if (!(e instanceof LimiteAlcanzado)) throw e;
    log(`  límite de ${limite} llamadas alcanzado tras ${hechas} de ${lotes.length} tandas; vuelve a ejecutar para seguir`);
  }

  const ruta = join(PROMESAS_DIR, `${sigla}.json`);
  const previas: PromesaModelo[] = existsSync(ruta) ? json(ruta).promesas ?? [] : [];
  const todas = new Map(previas.map((p) => [p.id, p]));
  for (const p of nuevas) todas.set(p.id, p);
  // Un fichero propio sustituye a la caché de upstream en src/lib/promesas.ts: no se escribe vacío.
  if (todas.size) escribir(ruta, { promesas: [...todas.values()].sort((a, b) => a.id.localeCompare(b.id)) });
  log(`  ${nuevas.length} promesas con cita literal (${descartadas} descartadas); ${todas.size} en ${ruta}`);
}

// ---------- 3. juicio a ciegas ----------

type Candidata = Iniciativa & { texto: string };

async function juicio(sigla: string, tema: string) {
  const ruta = join(PROMESAS_DIR, `${sigla}.json`);
  if (!existsSync(ruta)) throw new Error(`Falta ${ruta}: ejecuta antes \`bun scripts/promesas.ts promesas ${sigla} ${tema}\``);
  const lista = (json(ruta).promesas as PromesaModelo[]).filter((p) => p.tema === tema);
  const candidatas: Candidata[] = iniciativasDeTema(tema).map((i) => ({
    ...i,
    texto: (votacion(i.votaciones[0].id)?.texto ?? "").slice(0, 700),
  }));
  const buscador = new Buscador(candidatas, (c) => `${c.titulo} ${c.texto}`);
  log(`${sigla} ${tema}: ${lista.length} promesas, ${candidatas.length} iniciativas del tema`);

  const salida = join(JUICIOS, `${sigla}-${tema}.json`);
  const previas = new Map<string, Relacion[]>(
    existsSync(salida) ? (json(salida).promesas as { id: string; relaciones: Relacion[] }[]).map((p) => [p.id, p.relaciones]) : [],
  );
  const validas = new Set<string>(["cumple", "avanza", "contradice", "relacionada", "no_relacionada"]);
  try {
    for (const [n, p] of lista.entries()) {
      if (p.competencia === "ninguna" || p.verificabilidad === "baja") continue; // como upstream: no se juzgan
      const cands = buscador.buscar(`${p.objeto} ${p.resumen}`);
      if (!cands.length) continue;
      const actos = barajar(cands, p.id)
        .map((a) => `[${a.id}] (${a.tipo}, ${a.fecha.slice(0, 4)}) ${anonimo(a.titulo)}. ${anonimo(a.texto).slice(0, 500)}`)
        .join("\n");
      const mensaje = formato(PROMPT_JUICIO, { promesa: p.resumen, objeto: p.objeto, actos });
      const r = await conCache("juicio\x1f" + mensaje, mensaje, ESQ_JUICIO);
      log(`  promesa ${n + 1}/${lista.length} ${p.id} (${llamadas} llamadas)`);
      if (!r) continue;
      const ids = new Set(cands.map((c) => c.id));
      const rel = ((r.relaciones ?? []) as { id: string; relacion: string; motivo?: string }[])
        .filter((x) => ids.has(x?.id) && validas.has(x.relacion))
        .map((x) => ({ iniciativa: x.id, relacion: x.relacion as TipoRelacion, ...(x.motivo ? { motivo: x.motivo } : {}) }));
      previas.set(p.id, rel);
    }
  } catch (e) {
    if (!(e instanceof LimiteAlcanzado)) throw e;
    log(`  límite de ${limite} llamadas alcanzado; vuelve a ejecutar para seguir`);
  }
  if (previas.size)
    escribir(salida, {
    promesas: [...previas].sort(([a], [b]) => a.localeCompare(b)).map(([id, relaciones]) => ({ id, relaciones })),
  });
  log(`  ${previas.size} promesas juzgadas en ${salida}`);
}

// ---------- CLI ----------

async function main() {
  const args = process.argv.slice(2);
  const i = args.indexOf("--limite");
  if (i >= 0) {
    limite = Number(args[i + 1]);
    if (!Number.isInteger(limite) || limite < 0) throw new Error("--limite necesita un número entero");
    args.splice(i, 2);
  }
  const [orden, a, b] = args;
  const sigla = a?.toUpperCase();
  if (orden !== "texto" && (!sigla || !PROGRAMAS[sigla])) throw new Error(`Sigla desconocida: ${a}. Usa una de ${Object.keys(PROGRAMAS).join(", ")}`);
  if (b !== undefined && !(b in TEMAS)) throw new Error(`Tema desconocido: ${b}`);
  if (orden === "texto") await texto(a ?? PDFS_POR_DEFECTO);
  else if (orden === "promesas") await promesas(sigla!, b);
  else if (orden === "juicio" && b) await juicio(sigla!, b);
  else throw new Error("Uso: bun scripts/promesas.ts texto [carpeta] | promesas <SIGLA> [tema] | juicio <SIGLA> <tema> [--limite N]");
  if (orden !== "texto") log(`llamadas a la IA: ${llamadas}`);
}

main().catch((e) => {
  log((e as Error).message);
  process.exit(1);
});
