// Fetches the pinned Escaño Abierto snapshot into data/.
//
// Deterministic: the same commit always produces byte-identical files. The only date written is
// `fetched` in data/source.json, and it is kept from the previous run unless the commit changes.
//
// Usage: bun run data:fetch

import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { isDeepStrictEqual } from "node:util";

const REPO = "jorgegarcelan/escano-abierto";
const COMMIT = "365e56d6de9f4ad5da9c9a022f4c7ccf6c07a031";
const FIRST_MONTH = "2023-08";
const LAST_MONTH = "2026-10";
// Constitution of the XV legislature: nothing dated earlier may enter the snapshot.
const XV_START = "2023-08-17";
// General election whose per-province results are kept (upstream id).
const ELECTION_2023 = "202307";

const RAW = `https://raw.githubusercontent.com/${REPO}/${COMMIT}`;
const CONTENTS = `https://api.github.com/repos/${REPO}/contents/site/datos?ref=${COMMIT}`;

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA = join(ROOT, "data");
const SOURCE = join(DATA, "source.json");

// Arrays of upstream site/datos/YYYY-MM.json, each written to data/<key>/YYYY-MM.json.
const MONTHLY = ["votaciones", "sesiones", "intervenciones", "items"] as const;
const ELECTIONS = "elecciones";

// Upstream files copied unchanged: [upstream path, local path under data/].
const COPIES: ReadonlyArray<readonly [string, string]> = [
  ["data/diputados.json", "diputados.json"],
  ["data/hemiciclo.json", "hemiciclo.json"],
  ["site/datos/indice.json", "indice.json"],
  ["data/geografia/territorios.json", `${ELECTIONS}/territorios.json`],
];

// Keys of upstream site/datos/elecciones/elecciones.json kept in data/elecciones/escanos-2026.json.
const SEATS_2026_KEYS = ["convocatoria", "votacion", "decreto", "escanos", "escanos_cambian", "padron"];

type FileEntry = { readonly path: string; readonly upstream: string; readonly records?: number };
type Session = { readonly id: string; readonly fecha: string };
type Intervention = { readonly s: string; readonly item: number };
type Election = { readonly id: string; readonly fecha: string; readonly prov: Record<string, object> };

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, { headers: { "User-Agent": "aquienconovoto2026-data-fetch" } });
  if (!res.ok) throw new Error(`GET ${url} failed: ${res.status} ${res.statusText}`);
  return res.text();
}

async function fetchJson(upstream: string): Promise<unknown> {
  return JSON.parse(await fetchText(`${RAW}/${upstream}`));
}

function toJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

// One record per line: compact, and a changed record shows up as a one-line diff.
function toJsonLines(records: readonly unknown[]): string {
  return `[\n${records.map((r) => JSON.stringify(r)).join(",\n")}\n]\n`;
}

async function listMonths(): Promise<string[]> {
  const entries = JSON.parse(await fetchText(CONTENTS)) as Array<{ name: string; type: string }>;
  return entries
    .filter((e) => e.type === "file" && /^\d{4}-\d{2}\.json$/.test(e.name))
    .map((e) => e.name.slice(0, 7))
    .filter((m) => m >= FIRST_MONTH && m <= LAST_MONTH)
    .sort();
}

async function previousFetchDate(): Promise<string | null> {
  try {
    const prev = JSON.parse(await readFile(SOURCE, "utf8")) as { commit?: string; fetched?: string };
    return prev.commit === COMMIT && prev.fetched ? prev.fetched : null;
  } catch {
    return null;
  }
}

async function resetDir(name: string): Promise<void> {
  const dir = join(DATA, name);
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });
}

// Fails on records outside the XV legislature or on broken joins, instead of filtering silently.
function checkMonth(month: string, arrays: Record<string, unknown[]>): void {
  const sessions = arrays.sesiones as Session[];
  const ids = new Set(sessions.map((s) => s.id));
  for (const s of sessions) {
    if (s.fecha < XV_START || !s.fecha.startsWith(month)) {
      throw new Error(`${month}: session ${s.id} dated ${s.fecha} is outside this month or the XV legislature`);
    }
  }
  const items = arrays.items.length;
  for (const iv of arrays.intervenciones as Intervention[]) {
    if (!ids.has(iv.s)) throw new Error(`${month}: intervention of unknown session ${iv.s}`);
    if (!Number.isInteger(iv.item) || iv.item < 0 || iv.item >= items) {
      throw new Error(`${month}: intervention item ${iv.item} out of range (${items} items)`);
    }
  }
}

async function fetchMonths(months: readonly string[]): Promise<FileEntry[]> {
  for (const key of MONTHLY) await resetDir(key);
  const files: FileEntry[] = [];
  for (const month of months) {
    const upstream = `site/datos/${month}.json`;
    const parsed = (await fetchJson(upstream)) as Record<string, unknown>;
    const arrays: Record<string, unknown[]> = {};
    for (const key of MONTHLY) {
      const value = parsed[key];
      if (!Array.isArray(value)) throw new Error(`${month}: missing ${key} array`);
      arrays[key] = value;
    }
    checkMonth(month, arrays);
    for (const key of MONTHLY) {
      const path = `data/${key}/${month}.json`;
      // Records are written as parsed: same fields and values.
      await writeFile(join(ROOT, path), toJsonLines(arrays[key]));
      files.push({ path, upstream, records: arrays[key].length });
    }
  }
  return files;
}

// 2023 results per province: the shape of upstream historico-202307.json, with each province record
// taken from provincias/NN.json, which adds `censo` and `nulos` and must match it on every other field.
async function fetchResults2023(): Promise<FileEntry> {
  const historyPath = `data/elecciones/historico-${ELECTION_2023}.json`;
  const history = (await fetchJson(historyPath)) as Election;
  const prov: Record<string, object> = {};
  for (const code of Object.keys(history.prov).sort()) {
    const byElection = (await fetchJson(`data/elecciones/provincias/${code}.json`)) as Record<string, object>;
    const record = byElection[ELECTION_2023] as Record<string, unknown> | undefined;
    if (!record) throw new Error(`provincias/${code}.json: missing ${ELECTION_2023}`);
    for (const [key, value] of Object.entries(history.prov[code])) {
      if (!isDeepStrictEqual(record[key], value)) {
        throw new Error(`provincias/${code}.json: ${key} differs from ${historyPath}`);
      }
    }
    prov[code] = record;
  }
  const path = `data/${ELECTIONS}/resultados-2023.json`;
  await writeFile(join(ROOT, path), toJson({ id: history.id, fecha: history.fecha, prov }));
  return {
    path,
    upstream: `${historyPath} + data/elecciones/provincias/NN.json (key ${ELECTION_2023})`,
    records: Object.keys(prov).length,
  };
}

async function fetchSeats2026(): Promise<FileEntry> {
  const upstream = "site/datos/elecciones/elecciones.json";
  const all = (await fetchJson(upstream)) as Record<string, unknown>;
  const kept: Record<string, unknown> = {};
  for (const key of SEATS_2026_KEYS) {
    if (!(key in all)) throw new Error(`${upstream}: missing ${key}`);
    kept[key] = all[key];
  }
  const seats = kept.escanos as Record<string, number>;
  const total = Object.values(seats).reduce((sum, n) => sum + n, 0);
  if (total !== 350) throw new Error(`${upstream}: escanos add up to ${total}, not 350`);
  const path = `data/${ELECTIONS}/escanos-2026.json`;
  await writeFile(join(ROOT, path), toJson(kept));
  return { path, upstream, records: Object.keys(seats).length };
}

async function main(): Promise<void> {
  const months = await listMonths();
  if (months.length === 0) throw new Error("No monthly files found upstream");

  const files = await fetchMonths(months);

  await resetDir(ELECTIONS);
  files.push(await fetchResults2023(), await fetchSeats2026());

  for (const [upstream, local] of COPIES) {
    const text = await fetchText(`${RAW}/${upstream}`);
    JSON.parse(text); // fail early on a broken download
    const path = `data/${local}`;
    await writeFile(join(ROOT, path), text);
    files.push({ path, upstream });
  }

  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date());
  const source = {
    name: "Escaño Abierto",
    repository: `https://github.com/${REPO}`,
    commit: COMMIT,
    fetched: (await previousFetchDate()) ?? today,
    license: { code: "MIT", data: "CC BY 4.0" },
    months: { first: months[0], last: months[months.length - 1], missing: missingMonths(months) },
    files,
  };
  await writeFile(SOURCE, toJson(source));

  const totals = MONTHLY.map((key) => {
    const n = files.filter((f) => f.path.startsWith(`data/${key}/`)).reduce((sum, f) => sum + (f.records ?? 0), 0);
    return `${n} ${key}`;
  });
  console.log(`Wrote ${months.length} months (${totals.join(", ")}) and elections, commit ${COMMIT}`);

  // Derived from the files above, so it runs once they are written.
  await import("./temas.ts");
}

function missingMonths(months: readonly string[]): string[] {
  const present = new Set(months);
  const missing: string[] = [];
  let [y, m] = FIRST_MONTH.split("-").map(Number) as [number, number];
  for (;;) {
    const key = `${y}-${String(m).padStart(2, "0")}`;
    if (key > LAST_MONTH) break;
    if (!present.has(key)) missing.push(key);
    m = m === 12 ? 1 : m + 1;
    if (m === 1) y += 1;
  }
  return missing;
}

await main();
