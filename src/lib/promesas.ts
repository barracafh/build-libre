// Promesas de los programas del 23J y su relación con las iniciativas votadas. Port a TypeScript de
// reforma-digital apps/ingestion/escano/promesas.py (las funciones de texto, el BM25 y el anonimizado);
// el script que llama a la IA es scripts/promesas.ts.
//
// Solo servidor: lee el disco (process.cwd()).
//
// Fuentes de promesas, por candidatura:
// - src/datos/promesas/<SIGLA>.json, escrito por `bun scripts/promesas.ts promesas <SIGLA>` con HelmCode.
// - Si no existe (o está vacío), las 704 promesas de la caché de upstream (data/promesas/cache/*.json con «promesas»),
//   marcadas `origen: "cache-upstream"`. Upstream solo publicaba las que pasaban el filtro de cita literal;
//   aquí no se puede volver a aplicar porque su texto salió de pdftotext y el nuestro puede ser otro.
//
// Ids de unidad y promesa: SIGLA-PPP-NNNN (página del PDF con 3 cifras y contador de unidades sobre todo el
// documento con 4), como upstream.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// ---------- tipos ----------

export type Direccion = "crear_ampliar" | "reducir_suprimir" | "derogar" | "mantener";
export type TipoRelacion = "cumple" | "avanza" | "contradice" | "relacionada" | "no_relacionada";

export type Promesa = {
  id: string;
  sigla: string;
  pagina: number;
  cita: string;
  resumen: string;
  objeto: string;
  tipo: string;
  direccion: Direccion;
  competencia: string;
  verificabilidad: string;
  tema: string;
  fuente: string;
  origen?: "cache-upstream" | "helmcode";
};

export type Relacion = { iniciativa: string; relacion: TipoRelacion; motivo?: string };

// Lo que devuelve el modelo por promesa (las nueve claves de upstream).
export type PromesaModelo = Pick<
  Promesa,
  "id" | "cita" | "resumen" | "objeto" | "tipo" | "direccion" | "competencia" | "verificabilidad" | "tema"
>;

export type Unidad = { id: string; pagina: number; texto: string };

// ---------- programas ----------

// Programa -> PDF oficial, igual que PROGRAMAS de upstream. `pdf` es el nombre del fichero descargado.
export const PROGRAMAS: Record<string, { pdf: string; nombre: string; url: string; partido: string | null }> = {
  PP: { pdf: "pp.pdf", nombre: "Partido Popular", partido: "PP", url: "https://www.pp.es/storage/2023/07/programa_electoral_pp_23j_feijoo_2023.pdf" },
  PSOE: { pdf: "psoe.pdf", nombre: "PSOE", partido: "PSOE", url: "https://www.psoe.es/media-content/2023/07/PROGRAMA_ELECTORAL-GENERALES-2023.pdf" },
  VOX: { pdf: "vox.pdf", nombre: "Vox", partido: "VOX", url: "https://www.voxespana.es/wp-content/uploads/2023/07/Programa-VOX-2023-con-menos-peso.pdf" },
  SUMAR: { pdf: "sumar.pdf", nombre: "Sumar", partido: "SUMAR", url: "https://movimientosumar.es/wp-content/uploads/2023/07/Un-Programa-para-ti.pdf" },
  ERC: { pdf: "erc.pdf", nombre: "ERC", partido: "ERC", url: "https://defensacatalunya.esquerrarepublicana.cat/documents/e2023-programa.pdf" },
  JUNTS: { pdf: "junts.pdf", nombre: "Junts", partido: "JUNTS", url: "https://web.archive.org/web/20230805224113id_/https://janhihaprou.cat/app/uploads/2023/07/Programa-Electoral-Junts-per-Catalunya-23J.pdf" },
  BILDU: { pdf: "bildu.pdf", nombre: "EH Bildu", partido: "BILDU", url: "https://ehbildu.eus/dokumentuak/23J-COMPROMISO-DE-EUSKAL-HERRIA-BILDU.pdf" },
  PNV: { pdf: "pnv.pdf", nombre: "EAJ-PNV", partido: "PNV", url: "https://www.eaj-pnv.eus/es/adjuntos-documentos/20945/pdf/con-voz-propia-programa-electoral-23-j" },
  BNG: { pdf: "bng.pdf", nombre: "BNG", partido: null, url: "https://www.bng.gal/media/bnggaliza/files/2023/07/05/23_bng_xerais_programa.pdf" },
  UPN: { pdf: "upn.pdf", nombre: "UPN", partido: null, url: "https://www.upn.org/wp-content/uploads/2023/07/Programa-Generales-23J_V2-1.pdf" },
};

export const fuentePagina = (sigla: string, pagina: number) => `${PROGRAMAS[sigla]?.url ?? ""}#page=${pagina}`;

// ---------- texto y unidades (sin IA) ----------

// Python cuenta puntos de código, no unidades UTF-16.
export const largo = (s: string) => [...s].length;
export const palabras = (s: string) => s.split(/\s+/).filter(Boolean).length;

const VINETA = /^\s*(?:\d{1,3}\s*[.)]|[•▪●◦·‣⁃➢➤►✓\-–—]|[\uF000-\uF8FF]|[a-z]\))\s+/u;
const INDICE = /\.{5,}\s*\d+\s*$/;
const NUM_PAGINA = /^\s*\d{1,3}\s*$/;

export function norm(s: string): string {
  s = s.normalize("NFKC").replace(/[«»“”]/g, '"').replace(/’/g, "'");
  s = s.replace(/([\p{L}\p{N}_])-\s+([\p{L}\p{N}_])/gu, "$1$2"); // palabras partidas al final de línea
  return s.replace(/\s+/g, " ").trim().toLowerCase();
}

const esMinuscula = (c: string) => c !== "" && c === c.toLowerCase() && c !== c.toUpperCase();

/**
 * Limpia las páginas de un PDF como `unidades()` de upstream y devuelve cada página como sus bloques
 * separados por una línea en blanco: quita cabeceras, pies y laterales (líneas de menos de 120 caracteres
 * repetidas en más del 30 % de las páginas, y al menos en 4), números de página y líneas del índice; une las
 * líneas de cada bloque reparando las palabras partidas con guion y quita la viñeta o el número del punto.
 */
export function limpiarPaginas(paginasTexto: string[]): string[] {
  const lineasPag = paginasTexto.map((p) => p.split(/\r?\n/).map((l) => l.trimEnd()));
  const cuenta = new Map<string, number>();
  for (const ls of lineasPag)
    for (const l of new Set(ls))
      if (l.trim() && largo(l) < 120) cuenta.set(norm(l), (cuenta.get(norm(l)) ?? 0) + 1);
  const umbral = Math.max(3, 0.3 * lineasPag.length);
  const repetidas = new Set([""]);
  for (const [l, n] of cuenta) if (n > umbral) repetidas.add(l);

  return lineasPag.map((ls) => {
    const bloques: string[][] = [];
    let actual: string[] = [];
    for (const l of ls) {
      if (repetidas.has(norm(l)) || NUM_PAGINA.test(l)) {
        if (actual.length) bloques.push(actual);
        actual = [];
        continue;
      }
      if (VINETA.test(l) && actual.length) {
        bloques.push(actual);
        actual = [];
      }
      actual.push(l.trim());
    }
    if (actual.length) bloques.push(actual);
    const textos: string[] = [];
    for (const b of bloques) {
      let texto = "";
      for (const l of b)
        texto = texto.endsWith("-") && esMinuscula(l.slice(0, 1)) ? texto.slice(0, -1) + l : texto ? `${texto} ${l}` : l;
      texto = texto.replace(VINETA, "").trim();
      if (!texto || INDICE.test(texto)) continue;
      textos.push(texto);
    }
    return textos.join("\n\n");
  });
}

export function partir(texto: string, maximo = 1100): string[] {
  if (largo(texto) <= maximo) return [texto];
  const frases = texto.split(/(?<=[.;:])\s+(?=[A-ZÁÉÍÓÚÑÇ«"])/u);
  const trozos: string[] = [];
  let actual = "";
  for (const f of frases) {
    if (actual && largo(actual) + largo(f) > maximo) {
      trozos.push(actual);
      actual = f;
    } else actual = `${actual} ${f}`.trim();
  }
  return actual ? [...trozos, actual] : trozos;
}

export const idUnidad = (sigla: string, pagina: number, n: number) =>
  `${sigla}-${String(pagina).padStart(3, "0")}-${String(n).padStart(4, "0")}`;

// Página de un id SIGLA-PPP-NNNN, o null si no tiene esa forma.
export function paginaDeId(id: string): number | null {
  const m = /^[A-Z]+-(\d{3,})-\d{4,}$/.exec(id);
  return m ? Number(m[1]) : null;
}

/** Unidades (párrafos, puntos numerados, viñetas) de las páginas ya limpias, con el id de upstream. */
export function unidades(paginasLimpias: string[], sigla: string): Unidad[] {
  const out: Unidad[] = [];
  paginasLimpias.forEach((p, i) => {
    const pagina = i + 1;
    for (const bloque of p.split("\n\n"))
      for (const trozo of partir(bloque))
        if (palabras(trozo) >= 8) out.push({ id: idUnidad(sigla, pagina, out.length + 1), pagina, texto: trozo });
  });
  return out;
}

export function citaLiteral(cita: string, texto: string): boolean {
  const c = norm(cita).replace(/^[ ."]+|[ ."]+$/g, "");
  return palabras(c) >= 5 && norm(texto).includes(c);
}

export function tandas(us: Unidad[], caracteres = 7000): Unidad[][] {
  const out: Unidad[][] = [];
  let actual: Unidad[] = [];
  let n = 0;
  for (const u of us) {
    if (actual.length && n + largo(u.texto) > caracteres) {
      out.push(actual);
      actual = [];
      n = 0;
    }
    actual.push(u);
    n += largo(u.texto);
  }
  return actual.length ? [...out, actual] : out;
}

// ---------- buscador (BM25, sin IA) ----------

const VACIAS = new Set(
  `a al algo algun alguna algunas alguno algunos ante antes como con contra cual cuando de del desde donde
durante e el ella ellas ellos en entre era es esa esas ese eso esos esta estas este esto estos fue ha han hasta la las le
les lo los mas me mi mientras muy nos o os otra otras otro otros para pero por porque que quien se sea segun ser si sin
sobre su sus tambien tan te tiene todo todos tras tu un una uno unos y ya ley leyes proposicion proyecto grupo
parlamentario relativa sobre medidas gobierno congreso modificacion organica real decreto`.split(/\s+/),
);

// Raíces de seis letras, sin tildes ni palabras vacías (la ñ queda en n, como en upstream).
export function tokens(s: string): string[] {
  const t = s.toLowerCase().normalize("NFD").replace(/\p{Mn}/gu, "");
  return (t.match(/[a-z0-9ñ]{3,}/g) ?? []).filter((x) => !VACIAS.has(x)).map((x) => x.slice(0, 6));
}

const contar = (ts: string[]) => {
  const m = new Map<string, number>();
  for (const t of ts) m.set(t, (m.get(t) ?? 0) + 1);
  return m;
};

export class Buscador<D> {
  docs: D[];
  tf: Map<string, number>[];
  largos: number[];
  medio: number;
  idf = new Map<string, number>();
  k1: number;
  b: number;

  constructor(docs: D[], texto: (d: D) => string, k1 = 1.4, b = 0.75) {
    this.docs = docs;
    this.k1 = k1;
    this.b = b;
    this.tf = docs.map((d) => contar(tokens(texto(d))));
    this.largos = this.tf.map((t) => [...t.values()].reduce((a, x) => a + x, 0));
    this.medio = this.largos.reduce((a, x) => a + x, 0) / Math.max(1, this.largos.length);
    const df = new Map<string, number>();
    for (const t of this.tf) for (const k of t.keys()) df.set(k, (df.get(k) ?? 0) + 1);
    for (const [k, c] of df) this.idf.set(k, Math.log(1 + (docs.length - c + 0.5) / (c + 0.5)));
  }

  buscar(consulta: string, n = 12): D[] {
    const q = new Set(tokens(consulta));
    const puntos: [number, number][] = [];
    this.tf.forEach((tf, i) => {
      let s = 0;
      for (const t of q) {
        const f = tf.get(t);
        if (!f) continue;
        s += ((this.idf.get(t) ?? 0) * f * (this.k1 + 1)) / (f + this.k1 * (1 - this.b + (this.b * this.largos[i]) / this.medio));
      }
      if (s > 0) puntos.push([s, i]);
    });
    return puntos
      .sort((x, y) => y[0] - x[0] || y[1] - x[1])
      .slice(0, n)
      .map(([, i]) => this.docs[i]);
  }
}

const GRUPOS = new RegExp(
  String.raw`(?:Grupos? Parlamentarios? (?:de |del )?)?(?:Socialista|Popular en el Congreso|Popular|VOX|Vox|Plurinacional SUMAR|` +
    String.raw`SUMAR|Sumar|Republicano|Junts per Catalunya|Euskal Herria Bildu|EH Bildu|Vasco \(EAJ-PNV\)|EAJ-PNV|PNV|Mixto|` +
    String.raw`PSOE|PP|ERC|Junts|Bildu|BNG|UPN|Coalición Canaria|Podemos)(?:\s*\([^)]*\))?`,
  "gu",
);

/** Quita nombres de partidos y grupos (el juicio se hace a ciegas). */
export const anonimo = (s: string) => s.replace(GRUPOS, "[GRUPO]").replace(/(\[GRUPO\][,\sy]*)+\[GRUPO\]/g, "[GRUPO]");

// Barajado determinista a partir de una semilla de texto (upstream usa random.Random(id); no es el mismo orden).
export function barajar<T>(xs: T[], semilla: string): T[] {
  let h = 2166136261;
  for (const c of semilla) h = Math.imul(h ^ c.codePointAt(0)!, 16777619);
  const rnd = () => {
    h = (h + 0x6d2b79f5) | 0;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const out = xs.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// ---------- lectura ----------

const RAIZ = () => process.cwd();
export const CARPETA_PROMESAS = () => join(RAIZ(), "src", "datos", "promesas");
const leerJson = (ruta: string) => JSON.parse(readFileSync(ruta, "utf8"));

const DIRECCIONES = new Set(["crear_ampliar", "reducir_suprimir", "derogar", "mantener"]);

function completa(p: PromesaModelo, origen: Promesa["origen"]): Promesa | null {
  const pagina = paginaDeId(p.id);
  const sigla = p.id.split("-")[0];
  if (pagina === null || !PROGRAMAS[sigla]) return null;
  return {
    id: p.id,
    sigla,
    pagina,
    cita: p.cita,
    resumen: p.resumen,
    objeto: p.objeto,
    tipo: p.tipo,
    direccion: (DIRECCIONES.has(p.direccion) ? p.direccion : "crear_ampliar") as Direccion,
    competencia: p.competencia,
    verificabilidad: p.verificabilidad,
    tema: p.tema,
    fuente: fuentePagina(sigla, pagina),
    origen,
  };
}

let cachePromesas: Map<string, Promesa[]> | undefined;

function upstream(): Map<string, Promesa[]> {
  const dir = join(RAIZ(), "data", "promesas", "cache");
  const por = new Map<string, Map<string, Promesa>>();
  if (!existsSync(dir)) return new Map();
  for (const f of readdirSync(dir).filter((x) => x.endsWith(".json")).sort()) {
    const d = leerJson(join(dir, f));
    if (!Array.isArray(d?.promesas)) continue;
    for (const raw of d.promesas as PromesaModelo[]) {
      const p = completa(raw, "cache-upstream");
      if (!p) continue;
      if (!por.has(p.sigla)) por.set(p.sigla, new Map());
      por.get(p.sigla)!.set(p.id, p);
    }
  }
  return new Map([...por].map(([s, m]) => [s, [...m.values()].sort((a, b) => a.id.localeCompare(b.id))]));
}

/** Todas las promesas por sigla: las propias si existen, si no las de la caché de upstream. */
export function todasLasPromesas(): Map<string, Promesa[]> {
  if (cachePromesas) return cachePromesas;
  const up = upstream();
  const out = new Map<string, Promesa[]>();
  for (const sigla of Object.keys(PROGRAMAS)) {
    const ruta = join(CARPETA_PROMESAS(), `${sigla}.json`);
    const propias = existsSync(ruta)
      ? ((leerJson(ruta).promesas ?? []) as PromesaModelo[])
          .map((p) => completa(p, "helmcode"))
          .filter((p): p is Promesa => p !== null)
      : null;
    out.set(sigla, propias?.length ? propias : (up.get(sigla) ?? []));
  }
  cachePromesas = out;
  return out;
}

/** Promesas de un tema por código de partido (src/config/partidos.json); sin BNG ni UPN. */
export function promesasDeTema(slug: string): Record<string, Promesa[]> {
  const r: Record<string, Promesa[]> = {};
  for (const [sigla, lista] of todasLasPromesas()) {
    const partido = PROGRAMAS[sigla]?.partido;
    if (!partido) continue;
    const delTema = lista.filter((p) => p.tema === slug);
    if (delTema.length) r[partido] = delTema;
  }
  return r;
}

let cacheRelaciones: Map<string, Relacion[]> | undefined;

/** Relaciones juzgadas de una promesa (src/datos/promesas/juicios/*.json), o [] si no se ha juzgado. */
export function relacionesDePromesa(id: string): Relacion[] {
  if (!cacheRelaciones) {
    cacheRelaciones = new Map();
    const dir = join(CARPETA_PROMESAS(), "juicios");
    if (existsSync(dir))
      for (const f of readdirSync(dir).filter((x) => x.endsWith(".json")).sort())
        for (const p of (leerJson(join(dir, f)).promesas ?? []) as { id: string; relaciones: Relacion[] }[])
          cacheRelaciones.set(p.id, p.relaciones ?? []);
  }
  return cacheRelaciones.get(id) ?? [];
}
