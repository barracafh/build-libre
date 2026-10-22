// Writes data/escaner.json: what the Escáner político view shows, from the analysis in
// docs/programas-2023/posiciones/ and the snapshot in data/. Read through `escaner()` in
// src/lib/datos.ts.
//
// Usage: node scripts/escaner.ts
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const read = (...p: string[]) => JSON.parse(readFileSync(join(process.cwd(), ...p), "utf8"));

const PARTIDOS = [
  { id: "PP", nombre: "PP", art: "el PP", full: "Partido Popular", form: ["PP"] },
  { id: "PSOE", nombre: "PSOE", art: "el PSOE", full: "Partido Socialista Obrero Español", form: ["PSOE", "PSC-PSOE", "PsdeG-PSOE", "PSE-EE (PSOE)", "PSIB-PSOE", "PSN-PSOE"] },
  { id: "SUMAR", nombre: "Sumar", art: "Sumar", full: "Sumar", form: ["SUMAR"] },
  { id: "VOX", nombre: "Vox", art: "Vox", full: "Vox", form: ["VOX"] },
];
const TEMAS: Record<string, string> = {
  vivienda: "Vivienda", sanidad: "Sanidad", educacion: "Educación", pensiones: "Pensiones", empleo: "Empleo",
  impuestos: "Impuestos", energia: "Energía", clima: "Clima", campo: "Campo y pesca", igualdad: "Igualdad",
  inmigracion: "Inmigración", seguridad: "Seguridad", justicia: "Justicia", defensa: "Defensa",
  exteriores: "Política exterior", territorial: "Territorio", transporte: "Transporte", cultura: "Cultura",
  social: "Derechos sociales", tecnologia: "Tecnología", democracia: "Democracia",
};

const colores = read("src", "config", "partidos.json");
const indice = read("data", "indice.json");
const dips: unknown[][] = indice.diputados;
const ind: Record<string, number[]> = Object.fromEntries(
  PARTIDOS.map((p) => [p.id, dips.flatMap((d, i) => (p.form.includes(d[3] as string) ? [i] : []))]),
);

const votDir = join("data", "votaciones");
const mensuales = readdirSync(votDir).filter((f) => /^\d{4}-\d{2}\.json$/.test(f)).sort();
const V: Record<string, any> = {};
for (const f of mensuales) for (const v of read(votDir, f)) V[v.id] = v;
// El campo «aprobada» del volcado diario no es fiable (marca casi todo como rechazado): el resultado sale
// de los votos. Mayoría simple; la votación de conjunto de una ley orgánica pide mayoría absoluta (176).
const aprobada = (v: any) =>
  /conjunto/i.test(v.titulo + " " + (v.texto ?? "")) && /org[aá]nica/i.test(v.titulo + " " + (v.texto ?? "")) ? v.si >= 176 : v.si > v.no;

// Posición de una candidatura: sentido de la mayoría de sus diputados que votan; dividido por debajo del 80 %.
function posicion(voto: string, idx: number[]): string {
  const c: Record<string, number> = {};
  for (const i of idx) if ("SNA".includes(voto[i] ?? "-")) c[voto[i]] = (c[voto[i]] ?? 0) + 1;
  const tot = Object.values(c).reduce((a, b) => a + b, 0);
  if (!tot) return "";
  const [x, n] = Object.entries(c).sort((a, b) => b[1] - a[1])[0];
  return n / tot >= 0.8 ? x : "D";
}

const resultados = read("docs", "programas-2023", "posiciones", "resultados.json");
const generales = read("docs", "programas-2023", "posiciones", "posiciones_generales.json");

const usadas = new Set<string>();
const frases = resultados.map((o: any) => {
  const enlaces = o.votaciones.map((v: any) => {
    usadas.add(v.id);
    return { v: v.id, s: v.relacion === "contradice" ? "contradice" : "apoya", rel: v.relacion, motivo: v.motivo };
  });
  return { id: o.id, tema: o.tema, partido: o.partido, cita: o.cita, pagina: o.pagina, postura: o.postura, subtema: o.subtema, enlaces };
});

// Artículos de prensa comprobados por votación (docs/programas-2023/posiciones/noticias.json).
const noticias: Record<string, any[]> = read("docs", "programas-2023", "posiciones", "noticias.json");

const votaciones: Record<string, any> = {};
for (const id of usadas) {
  const v = V[id];
  const votos = Object.fromEntries(PARTIDOS.map((p) => [p.id, posicion(v.v, ind[p.id])]));
  const porque: Record<string, string> = {};
  for (const p of PARTIDOS) if (v.porque?.[p.id]) porque[p.id] = v.porque[p.id][0];
  votaciones[id] = {
    fecha: v.fecha, tipo: v.tipo, titulo: v.titulo, url: v.json, aprobada: aprobada(v), proponente: v.proponente ?? "",
    si: v.si, no: v.no, abst: v.abst, novota: v.novota, conteo: v.conteo, votos, porque,
    noticias: (noticias[id] ?? []).map(({ medio, titular, url, fecha }) => ({ medio, titular, url, fecha })),
  };
}

// Por tema: votaciones del Pleno, frases y peso en los cuatro programas; y cómo votó cada partido en ellas.
const todas = Object.values(V);
const temas = Object.entries(TEMAS).map(([id, nombre]) => {
  const vs = todas.filter((v: any) => (v.tm ?? []).includes(id));
  const sentidos = Object.fromEntries(PARTIDOS.map((p) => {
    const c = { S: 0, N: 0, A: 0, D: 0 } as Record<string, number>;
    for (const v of vs) { const x = posicion(v.v, ind[p.id]); if (x) c[x]++; }
    return [p.id, c];
  }));
  return { id, nombre, votaciones: vs.length, frases: frases.filter((f: any) => f.tema === id).length, sentidos };
});
const cuotas = read("docs", "programas-2023", "temas_partido.json");
for (const t of temas as any[]) {
  const rows = cuotas.filter((r: any) => r.tema === t.id && PARTIDOS.some((p) => p.id === r.partido));
  t.programa = rows.length ? rows.reduce((a: number, r: any) => a + r.cuota_programa, 0) / rows.length : 0;
}

const tipos: Record<string, number> = {};
for (const v of todas as any[]) tipos[v.tipo] = (tipos[v.tipo] ?? 0) + 1;
const amplias = (todas as any[]).filter((v) => v.si / (v.si + v.no + v.abst || 1) >= 0.8).length;

const out = {
  generado: new Date().toISOString().slice(0, 10),
  fuente: read("data", "source.json").commit,
  total: todas.length,
  conTema: (todas as any[]).filter((v) => (v.tm ?? []).length).length,
  desde: (todas as any[]).map((v) => v.fecha).sort()[0],
  hasta: (todas as any[]).map((v) => v.fecha).sort().at(-1),
  tipos, amplias,
  partidos: PARTIDOS.map(({ form, ...p }) => ({ ...p, color: colores[p.id].color })),
  grupos: Object.fromEntries(Object.entries(indice.grupos).filter(([k]) => !["GOB", "MESA", "COMP", "?"].includes(k)).map(([k, g]: any) => [k, g.color])),
  temas,
  posiciones: Object.fromEntries(generales.map((g: any) => [`${g.tema}|${g.partido}`, g.posicion_general])),
  cortas: read("docs", "programas-2023", "posiciones", "posiciones_cortas.json"),
  frases,
  votaciones,
};
writeFileSync(join("data", "escaner.json"), JSON.stringify(out));
console.log(`${frases.length} frases, ${Object.keys(votaciones).length} votaciones ligadas, ${temas.length} temas`);
