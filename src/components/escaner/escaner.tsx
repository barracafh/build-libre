"use client";

import { memo, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  ArrowLeft, Briefcase, ChevronDown, ChevronRight, Cpu, Drama, Earth, Equal, Gavel, Globe,
  GraduationCap, HeartHandshake, Hourglass, House, Landmark, Leaf, Map, Receipt, ScanLine,
  Shield, ShieldCheck, Stethoscope, TrainFront, Wheat, Zap, type LucideIcon,
} from "lucide-react";
import { Fuentes, type Source } from "@/components/fuentes";
import type { DatosEscaner, VotoEscaner } from "@/lib/datos";

// ---------- Datos (data/escaner.json through escaner() in src/lib/datos.ts) ----------
type Voto = VotoEscaner;
type Partido = DatosEscaner["partidos"][number];
type Tema = DatosEscaner["temas"][number];
type Frase = DatosEscaner["frases"][number];
type Enlace = Frase["enlaces"][number];
type Votacion = DatosEscaner["votaciones"][string];
// The page reads one dataset; the server component passes it in and it is set once here, so the
// helpers below can read it without threading it through every call.
let D: DatosEscaner;
let ITEMS: Item[] = [];
let fuentesProgramas: Source[] = [];
function cargar(datos: DatosEscaner) {
  if (D === datos) return;
  D = datos;
  ITEMS = D.frases.map(itemDe);
  fuentesProgramas = D.partidos.map((p) => ({ nombre: `Programa electoral de 2023 · ${p.full}`, url: PROGRAMAS[p.id].url }));
}

const PROGRAMAS: Record<string, { paginas: number; url: string }> = {
  PP: { paginas: 112, url: "https://www.pp.es/storage/2023/07/programa_electoral_pp_23j_feijoo_2023.pdf" },
  PSOE: { paginas: 272, url: "http://web.archive.org/web/20261012141437/https://www.psoe.es/media-content/2023/07/PROGRAMA_ELECTORAL-GENERALES-2023.pdf" },
  SUMAR: { paginas: 182, url: "https://movimientosumar.es/wp-content/uploads/2023/07/Un-Programa-para-ti.pdf" },
  VOX: { paginas: 178, url: "http://web.archive.org/web/20250313193448/https://www.voxespana.es/wp-content/uploads/2023/07/Programa-VOX-2023-con-menos-peso.pdf" },
};
const FUENTES: Record<string, Source> = {
  congreso: { nombre: "Votaciones del Pleno · Congreso de los Diputados", url: "https://www.congreso.es/es/opendata/votaciones" },
  bocg: { nombre: "Boletín Oficial de las Cortes Generales · Congreso", url: "https://www.congreso.es/es/busqueda-de-publicaciones" },
  escano: { nombre: "Escaño Abierto (no oficial: reúne los datos del Congreso y les asigna tema)", url: "https://github.com/jorgegarcelan/escano-abierto" },
};

const ICONS: Record<string, LucideIcon> = {
  vivienda: House, sanidad: Stethoscope, educacion: GraduationCap, pensiones: Hourglass, empleo: Briefcase,
  impuestos: Receipt, energia: Zap, clima: Leaf, campo: Wheat, igualdad: Equal, inmigracion: Globe,
  seguridad: ShieldCheck, justicia: Gavel, defensa: Shield, exteriores: Earth, territorial: Map,
  transporte: TrainFront, cultura: Drama, social: HeartHandshake, tecnologia: Cpu, democracia: Landmark,
};
const QUE: Record<string, string> = {
  "Convalidación RDL": "Se votaba convalidar el decreto-ley del Gobierno.",
  "Toma en consideración": "Se votaba si el Congreso empezaba a tramitar la ley.",
  "Proposición no de ley": "Se votaba una petición al Gobierno, sin efecto legal.",
  "Moción": "Se votaba una moción: una petición al Gobierno, sin efecto legal.",
  "Proyecto de ley": "Se votaba una parte de la ley: artículos o enmiendas.",
  "Enmiendas del Senado": "Se votaban los cambios del Senado a una ley.",
  "Dictamen": "Se votaba el texto de la ley que salió de la comisión.",
};
const REL: Record<string, string> = {
  cumple: "La votación hace lo que dice la frase",
  avanza: "La votación va en la misma dirección, en parte",
  contradice: "La votación va en contra de lo que dice la frase",
};
const VOTO_TXT: Record<string, string> = { S: "sí", N: "no", A: "abstención", D: "dividido" };
const VOTO_CORTO: Record<string, string> = { S: "sí", N: "no", A: "abst.", D: "div.", "": "no votó" };
const COH: Record<string, string> = { ok: "a favor de lo que dice", bad: "en contra de lo que dice", nv: "se abstuvo o dividido" };
const COH_BADGE: Record<string, string> = { ok: "okb", bad: "destructive", nv: "outline" };
// Quién presentó la iniciativa (campo `proponente` del volcado).
const PROPONE: Record<string, string> = {
  GOB: "el Gobierno", PP: "el PP", PSOE: "el PSOE", SUMAR: "Sumar", VOX: "Vox", ERC: "ERC", JUNTS: "Junts",
  BILDU: "EH Bildu", PNV: "el PNV", MIXTO: "el Grupo Mixto",
};
// Grupos del Pleno de izquierda a derecha para el hemiciclo.
const ORDEN = ["SUMAR", "BILDU", "ERC", "PSOE", "PNV", "JUNTS", "MIXTO", "PP", "VOX"];


// ---------- Cálculos ----------
type Coh = "ok" | "bad" | "nv";
type Link = Enlace & { vot: Votacion; coh: Coh };
type Item = { x: Frase; es: Link[]; bad: number; nv: number };

const partidoById = (id: string) => D.partidos.find((p) => p.id === id)!;
const temaById = (id: string) => D.temas.find((t) => t.id === id)!;
const fmtPct = (n: number) => n.toLocaleString("es-ES", { maximumFractionDigits: 1 }) + " %";
const fmtN = (n: number) => n.toLocaleString("es-ES");
const fecha = (iso: string) => new Date(iso + "T12:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
const pc = (color: string) => ({ "--pc": color }) as CSSProperties;

function coherencia(partido: string, e: Enlace): Coh | null {
  const voto = D.votaciones[e.v]?.votos[partido];
  if (!voto) return null;
  if (voto === "A" || voto === "D") return "nv";
  return (e.s === "apoya") === (voto === "S") ? "ok" : "bad";
}
function itemDe(x: Frase): Item {
  const es = x.enlaces
    .map((e) => ({ ...e, vot: D.votaciones[e.v], coh: coherencia(x.partido, e) }))
    .filter((e): e is Link => e.coh !== null)
    .sort((a, b) => a.vot.fecha.localeCompare(b.vot.fecha));
  return { x, es, bad: es.filter((e) => e.coh === "bad").length, nv: es.filter((e) => e.coh === "nv").length };
}
const itemsDe = (tema?: string, partido?: string) => ITEMS.filter((i) => (!tema || i.x.tema === tema) && (!partido || i.x.partido === partido));
function resumen(tema: string, partido?: string) {
  const c = { ok: 0, bad: 0, nv: 0, votos: 0, frases: 0, sinVotar: 0, vids: new Set<string>() };
  itemsDe(tema, partido).forEach((i) => {
    c.frases++;
    if (!i.es.length) c.sinVotar++;
    i.es.forEach((e) => { c[e.coh]++; c.votos++; c.vids.add(e.v); });
  });
  return c;
}
// Brecha dicho-hecho de un tema: en cuántos de los cuatro partidos hay votos en contra de su programa y,
// de media entre los partidos con votos ligados, qué parte de sus votos fue en contra. Solo cuenta el rojo.
function brecha(tema: string) {
  const ps = D.partidos.map((p) => resumen(tema, p.id)).filter((c) => c.votos);
  if (!ps.length) return null;
  return { partidos: ps.filter((c) => c.bad).length, pct: Math.round((ps.reduce((a, c) => a + c.bad / c.votos, 0) / ps.length) * 100) };
}
const statusOf = (i: Item) => (!i.es.length ? "none" : i.bad ? "bad" : i.nv ? "nv" : "ok");

const SORTS: Record<string, { key: (t: Tema) => number; label: string; note: string }> = {
  votado: { key: (t) => t.votaciones, label: "Más votado", get note() { return `Ordenado por el número de votaciones del Pleno sobre el tema, de ${fecha(D.desde)} a ${fecha(D.hasta)}.`; } },
  frases: { key: (t) => t.frases, label: "Más presente en los programas", note: "Ordenado por cuántas frases de los cuatro programas de 2023 tratan el tema." },
  brecha: {
    key: (t) => { const b = brecha(t.id); return b ? b.partidos * 1000 + b.pct : -1; },
    label: "Brecha dicho-hecho",
    note: "Arriba, los temas en los que más partidos votaron en contra de lo que decía su programa; a igualdad, los que tienen más votos en contra de media por partido.",
  },
};

// ---------- Piezas ----------
// Coherencia con el programa (verde, rojo, gris) o, con `votos`, el sentido del voto en tonos neutros.
function Bar({ ok, bad, nv, votos }: { ok: number; bad: number; nv: number; votos?: boolean }) {
  const tot = ok + bad + nv;
  if (!tot) return null;
  const seg = (cls: string, n: number) => (n > 0 ? <span className={cls} style={{ flex: `${n} 1 0` }}>{n / tot >= 0.1 ? n : ""}</span> : null);
  const [a, b, c] = votos ? ["yes-bg", "no-bg", "ab-bg"] : ["ok-bg", "bad-bg", "nv-bg"];
  const label = votos ? `${ok} sí, ${bad} no, ${nv} abstención o dividido` : `${ok} a favor de lo que dice su programa, ${bad} en contra, ${nv} abstención o dividido`;
  return <div className="bar" role="img" aria-label={label}>{seg(a, ok)}{seg(b, bad)}{seg(c, nv)}</div>;
}

function PageThumb({ items }: { items: Item[] }) {
  const W = 40, H = 56, pad = 6, top = 12, pitch = 4.4, n = Math.floor((H - top - 4) / pitch), k = items.length;
  const slots: (Item | null)[] = new Array(n).fill(null);
  items.forEach((it, j) => { slots[Math.min(n - 1, Math.max(0, Math.round(((j + 0.5) * n) / k - 0.5)))] = it; });
  const widths = [1, 0.82, 0.94, 0.68, 0.9, 0.76];
  return (
    <svg className="thumb" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      <rect x=".5" y=".5" width={W - 1} height={H - 1} rx="4" className="pg" />
      <path className="bandp" d={`M.5 4.5a4 4 0 0 1 4-4h${W - 9}a4 4 0 0 1 4 4v3.5H.5z`} />
      {slots.map((it, j) => it
        ? <rect key={j} x={pad} y={top + j * pitch} width={W - pad * 2} height="3" rx="1" className={`hl ${statusOf(it)}`} />
        : <rect key={j} x={pad} y={top + j * pitch} width={(W - pad * 2) * widths[j % 6]} height="2" rx="1" className="ln" />)}
    </svg>
  );
}

// Hemiciclo: 350 escaños en 10 filas; cada grupo ocupa sus escaños de izquierda a derecha.
const SEATS = (() => {
  const total = 350, rows = 10, r0 = 0.42, r1 = 1;
  const radii = Array.from({ length: rows }, (_, i) => r0 + ((r1 - r0) * i) / (rows - 1));
  const sum = radii.reduce((a, b) => a + b, 0), counts = radii.map((r) => Math.floor((total * r) / sum));
  let rest = total - counts.reduce((a, b) => a + b, 0);
  for (let i = rows - 1; rest > 0; i = (i - 1 + rows) % rows) { counts[i]++; rest--; }
  const seats: { a: number; r: number; x: number; y: number }[] = [];
  radii.forEach((r, i) => { const n = counts[i]; for (let j = 0; j < n; j++) { const a = Math.PI * (1 - j / (n - 1)); seats.push({ a, r, x: r * Math.cos(a), y: r * Math.sin(a) }); } });
  return seats.sort((s, t) => t.a - s.a || t.r - s.r);
})();
function Hemiciclo({ v, p }: { v: Votacion; p: Partido }) {
  const seq: { g: string; vt: string }[] = [];
  ORDEN.forEach((g) => Object.entries(v.conteo[g] ?? {}).forEach(([vt, k]) => { for (let i = 0; i < k; i++) seq.push({ g, vt }); }));
  while (seq.length < SEATS.length) seq.push({ g: "", vt: "X" });
  const otros = v.abst + v.novota;
  const resultado = v.aprobada === null ? "" : v.aprobada ? "Aprobada" : "Rechazada";
  return (
    <div className="hemi-wrap">
      <svg className="hemi" viewBox="-1.03 -1.03 2.06 1.06" role="img" aria-label={`${v.si} sí, ${v.no} no, ${otros} abstenciones o ausencias; resaltado, ${p.nombre}`}>
        {SEATS.map((s, k) => {
          const st = seq[k], small = st.vt === "A" || st.vt === "X", main = D.partidos.some((q) => q.id === st.g);
          return <circle key={k} cx={s.x.toFixed(3)} cy={(-s.y).toFixed(3)} r={small ? 0.013 : 0.024}
            className={`seat ${st.vt}${main ? " main" : ""}${st.g === p.id ? " mine" : ""}`} style={main ? pc(D.grupos[st.g]) : undefined} />;
        })}
        <text x="0" y="-.13" textAnchor="middle" fontSize=".15" className="hc-n">{v.si} – {v.no}</text>
        <text x="0" y="-.035" textAnchor="middle" fontSize=".065" className="hc-l">SÍ · NO</text>
      </svg>
      <div className="hc-leg">
        {D.partidos.map((q) => { const vq = v.votos[q.id] || ""; return (
          <span key={q.id} className={`hp${q.id === p.id ? " on" : ""}`} style={pc(q.color)}><i className={`lg ${vq || "X"}`} />{q.nombre} <em>{VOTO_CORTO[vq]}</em></span>
        ); })}
        <span className="hp oth"><i className="lg" />Otros grupos</span>
      </div>
      <div className="hc-leg">{resultado && <span className="hc-res">{resultado}</span>}{otros > 0 && <span>{otros} abst. o ausentes</span>}</div>
    </div>
  );
}

// Búsqueda de prensa sobre la votación: su título (sin el punto votado) y «Congreso», en la semana de la votación.
function noticias(v: Votacion) {
  const d = new Date(v.fecha + "T12:00:00");
  const f = (dias: number) => { const x = new Date(d); x.setDate(x.getDate() + dias); return `${x.getMonth() + 1}/${x.getDate()}/${x.getFullYear()}`; };
  const q = `${v.titulo.replace(/\s*\((punto|puntos|enmienda|enmiendas)[^)]*\)\s*$/i, "").replace(/…$/, "")} Congreso`;
  return `https://www.google.com/search?tbm=nws&q=${encodeURIComponent(q)}&tbs=${encodeURIComponent(`cdr:1,cd_min:${f(-7)},cd_max:${f(7)}`)}`;
}

function VoteRow({ e, p }: { e: Link; p: Partido }) {
  const v = e.vot, voto = v.votos[p.id], mot = e.coh !== "ok" ? v.porque[p.id] : "";
  const que = QUE[v.tipo] ?? "";
  return (
    <div className="vote">
      <span className="vm"><i className={`sw ${e.coh}-bg`} aria-hidden="true" />{fecha(v.fecha)} · {v.tipo}{PROPONE[v.proponente] ? ` · la propuso ${PROPONE[v.proponente]}` : ""}</span>
      <span className="vt"><a href={v.url} target="_blank" rel="noopener">{v.titulo} <span aria-hidden="true">↗</span></a></span>
      {que && <span className="que">{que}</span>}
      <span className="vr"><b>{p.nombre} votó {VOTO_TXT[voto]}</b><span className={`badge ${COH_BADGE[e.coh]}`}>{COH[e.coh]}</span></span>
      <div className="why"><div className="wl">{REL[e.rel]} <span className="badge outline">IA</span></div>{e.motivo.replace(/^\[[^\]]*\]\s*/, "")}</div>
      <Hemiciclo v={v} p={p} />
      {mot && <div className="why"><div className="wl">Motivo que dio el grupo en el debate <span className="badge outline">IA</span></div>{mot}</div>}
      <a className="src" href={v.url} target="_blank" rel="noopener">
        <span><span className="fname">Fuente oficial: {v.url.includes("/opendata/votaciones/") ? "votación en el Congreso" : "Diario de Sesiones del Congreso"}</span><span className="furl">{v.url.replace(/^https?:\/\//, "")}</span></span>
        <span aria-hidden="true">↗</span>
      </a>
      {v.noticias.length > 0 ? (
        <div className="press">
          <p className="press-h">En la prensa <span className="small">· no son fuentes oficiales</span></p>
          {v.noticias.map((n) => (
            <a key={n.url} className="src news" href={n.url} target="_blank" rel="noopener">
              <span><span className="furl">{n.medio} · {fecha(n.fecha)}</span><span className="fname">{n.titular}</span></span>
              <span aria-hidden="true">↗</span>
            </a>
          ))}
        </div>
      ) : (
        <a className="src news" href={noticias(v)} target="_blank" rel="noopener">
          <span><span className="fname">Buscar noticias de esta votación</span><span className="furl">No encontramos un artículo que la cubra. Búsqueda en Google Noticias en la semana del {fecha(v.fecha)}; no es una fuente oficial.</span></span>
          <span aria-hidden="true">↗</span>
        </a>
      )}
    </div>
  );
}

function copyText(i: Item) {
  const p = partidoById(i.x.partido);
  const lines = [`${p.nombre}, programa de 2023 (p. ${i.x.pagina}): «${i.x.cita}»`];
  if (!i.es.length) lines.push("Ninguna votación del Pleno lo trata.");
  i.es.forEach((e) => lines.push(`· ${fecha(e.vot.fecha)}: ${e.vot.titulo}. Votó ${VOTO_TXT[e.vot.votos[p.id]]} (${COH[e.coh]}). ${e.vot.url}`));
  return lines.join("\n");
}

function Promesa({ i, p, open, onToggle, onToast }: { i: Item; p: Partido; open: boolean; onToggle: () => void; onToast: (m: string) => void }) {
  const st = statusOf(i), ok = i.es.length - i.bad - i.nv;
  const [share, setShare] = useState("");
  return (
    <div className="leaf">
      <span className={`node ${st}`} aria-hidden="true" />
      <section className="card" id={`pr-${i.x.id}`}>
        <button className="pr-head" type="button" aria-expanded={open} onClick={onToggle}>
          <span className="pr-src">Programa 2023 · p. {i.x.pagina} · {i.x.subtema}</span>
          <span className="pr-q">«{i.x.cita}»</span>
          <span className="pr-foot">
            <span className="vcs">
              {!i.es.length ? <span className="vc none">Nunca se votó</span> : <>
                <span className={`vc ok${ok ? "" : " zero"}`}><b>{ok}</b> a favor</span>
                <span className={`vc bad${i.bad ? "" : " zero"}`}><b>{i.bad}</b> en contra</span>
                {i.nv > 0 && <span className="vc nv"><b>{i.nv}</b> abst. o dividido</span>}
              </>}
            </span>
            <span className="chev"><ChevronDown /></span>
          </span>
        </button>
        {open && (
          <div className="pr-body">
            {i.es.map((e) => <VoteRow key={e.v} e={e} p={p} />)}
            {!i.es.length && <p className="pr-note">Ninguna votación del Pleno de la legislatura hace lo que dice esta frase ni lo contradice.</p>}
            <div className="pr-actions">
              <button className="btn outline" type="button" onClick={async () => {
                const txt = copyText(i);
                try { await navigator.clipboard.writeText(txt); onToast("Copiado"); } catch { setShare(txt); onToast("Selecciona y copia el texto"); }
              }}>Copiar para compartir</button>
              {share && <textarea className="share" readOnly value={share} aria-label="Texto para compartir" onFocus={(e) => e.currentTarget.select()} />}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

// ---------- Escáner de la portada ----------
// Cada programa es una hoja con líneas de texto. Cada frase sacada del programa es un tramo de línea
// que el haz detecta al pasar y que toma el color de lo que votó el partido.
// Ancho de cada línea; 0, salto de párrafo. Unas 200 frases por programa: muchas líneas finas.
const SC_SLOTS = [1, .94, .98, .9, .56, 0, 1, .96, .92, .99, .7, 0, .97, 1, .62, 0, .95, .99, .8, .9, 0, 1, .93, .97, .66, 0, .98, .91, 1, .74, 0, .96, .99, .58];
const SWEEP = 3400;

// Las hojas no se vuelven a pintar: el barrido cambia sus clases directamente.
const ScanPaper = memo(function ScanPaper({ p }: { p: Partido }) {
  const items = itemsDe(undefined, p.id);
  const W = 60, H = 80, x0 = 6, w = 48, top = 16, pitch = 1.85;
  const lines = SC_SLOTS.flatMap((f, s) => (f ? [{ y: top + s * pitch, lw: w * f }] : []));
  const n = lines.length, k = items.length;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      <rect className="bandp" x="0" y="0" width={W} height="12" />
      <text className="bt" x={x0} y="5.6" fontSize="3.6">{p.nombre}</text>
      <text className="yr" x={x0} y="9.6" fontSize="2.3">PROGRAMA ELECTORAL 2023</text>
      {lines.map((l, j) => <rect key={j} className="tl" x={x0} y={l.y.toFixed(2)} width={l.lw.toFixed(2)} height="1" rx=".5" />)}
      {items.map((it, j) => {
        // Varias frases por línea, una tras otra, para que no se pisen.
        const line = Math.min(n - 1, Math.floor((j * n) / k)), inLine = Math.ceil(k / n), pos = j - Math.floor((line * k) / n);
        const l = lines[line], slot = l.lw / inLine, len = Math.max(2, slot * 0.78), sx = x0 + pos * slot, y = l.y, st = statusOf(it);
        return (
          <g key={it.x.id} className={`st ${st}`} data-y={((y + 0.5) / H).toFixed(4)} data-t={it.x.tema}>
            <rect className="bx" x={(sx - 0.4).toFixed(2)} y={(y - 0.4).toFixed(2)} width={(len + 0.8).toFixed(2)} height="1.8" rx=".4" />
            <rect className="sg" x={sx.toFixed(2)} y={y.toFixed(2)} width={len.toFixed(2)} height="1" rx=".5" />
          </g>
        );
      })}
      {lines.map((l, j) => items.some((it, i) => statusOf(it) === "bad" && Math.min(n - 1, Math.floor((i * n) / k)) === j)
        ? <circle key={`m${j}`} className="mk-line" cx="57" cy={(l.y + 0.5).toFixed(2)} r=".8" data-y={((l.y + 0.5) / H).toFixed(4)} /> : null)}
    </svg>
  );
});

function Scanner({ fase, onScan, onDone }: { fase: "idle" | "scanning" | "done"; onScan: () => void; onDone: () => void }) {
  const root = useRef<HTMLElement>(null);
  const [pct, setPct] = useState(0);
  const [found, setFound] = useState<string[]>(fase === "done" ? D.temas.map((t) => t.id) : []);

  useEffect(() => {
    const el = root.current!;
    const sts = [...el.querySelectorAll<SVGGElement>(".st")];
    const mks = [...el.querySelectorAll<SVGCircleElement>(".mk-line")];
    if (fase === "idle") { sts.forEach((s) => s.classList.remove("on", "hit")); mks.forEach((m) => m.classList.remove("on")); return; }
    if (fase === "done") { sts.forEach((s) => s.classList.add("on")); mks.forEach((m) => m.classList.add("on")); return; }
    // fase "scanning": un barrido de arriba abajo
    sts.forEach((s) => s.classList.remove("on", "hit"));
    mks.forEach((m) => m.classList.remove("on"));
    const beam = el.querySelector<HTMLElement>(".sc-beam")!, paper = el.querySelector<HTMLElement>(".sc-paper")!;
    const seen: string[] = [];
    // El tiempo cuenta desde el clic, y un temporizador cierra el barrido aunque el navegador frene los fotogramas.
    let raf = 0, finished = false;
    const t0 = performance.now();
    const frame = (now: number) => {
      if (finished) return;
      const p = Math.min(1, (now - t0) / SWEEP), ext = 12 / paper.offsetHeight, rel = -ext + p * (1 + 2 * ext);
      beam.style.transform = `translateY(${(paper.offsetTop + rel * paper.offsetHeight).toFixed(1)}px)`;
      beam.style.opacity = String(Math.max(0, Math.min(1, p / 0.05, (1 - p) / 0.05)));
      let changed = false;
      sts.forEach((s) => {
        if (!s.classList.contains("on") && rel >= Number(s.dataset.y)) {
          s.classList.add("on", "hit");
          if (!seen.includes(s.dataset.t!)) seen.push(s.dataset.t!);
          changed = true;
        }
      });
      mks.forEach((m) => { if (rel >= Number(m.dataset.y)) m.classList.add("on"); });
      if (changed) setFound([...seen]);
      setPct(Math.round(p * 100));
      if (p < 1) raf = requestAnimationFrame(frame);
      else finish();
    };
    const finish = () => {
      if (finished) return;
      finished = true;
      beam.style.opacity = "0";
      sts.forEach((s) => s.classList.add("on"));
      mks.forEach((m) => m.classList.add("on"));
      setFound(D.temas.map((t) => t.id));
      onDone();
    };
    raf = requestAnimationFrame(frame);
    const timer = setTimeout(finish, SWEEP + 400);
    return () => { cancelAnimationFrame(raf); clearTimeout(timer); };
  }, [fase, onDone]);

  const status = fase === "idle" ? `${D.partidos.length} programas electorales de las generales de 2023`
    : fase === "scanning" ? `Escaneando programas de 2023 · ${pct} %`
    : `${fmtN(ITEMS.length)} frases escaneadas · ${D.temas.length} temas encontrados`;
  return (
    <section ref={root} className={`scanner${fase === "scanning" ? " scanning" : ""}`} aria-label="Escáner de los programas electorales de 2023">
      <div className="sc-head">
        <span className="sc-title">Programas electorales · Generales 23J 2023</span>
        <span className="sc-meta">{fase === "idle" ? "Sin escanear" : "Frente a las votaciones del Pleno, XV legislatura"}</span>
      </div>
      <div className="sc-row">
        {D.partidos.map((p) => (
          <div className="sc-col" key={p.id} style={pc(p.color)}>
            <div className="sc-paper"><ScanPaper p={p} /></div>
            <div className="sc-lab">
              <span className="sc-pn"><i className="pdot" />{p.nombre}</span>
              <span>Programa 2023 · {PROGRAMAS[p.id].paginas} págs.</span>
            </div>
          </div>
        ))}
        <div className="sc-beam" aria-hidden="true" />
      </div>
      {fase !== "idle" && (
        <div className="sc-found" aria-live="polite">
          <span className="sc-found-lab">Temas encontrados · {found.length} de {D.temas.length}</span>
          {found.map((t) => { const Icon = ICONS[t]; return <span key={t} className="sc-chip"><Icon size={12} />{temaById(t).nombre}</span>; })}
        </div>
      )}
      <div className="sc-foot">
        <p className="sc-status"><i className="sc-dot" aria-hidden="true" /><span>{status}</span></p>
        {fase === "idle" && <button type="button" className="btn big light" onClick={onScan}><ScanLine size={18} />Escanear los programas</button>}
        {fase === "done" && <button type="button" className="btn dim" onClick={onScan}>Volver a escanear</button>}
      </div>
    </section>
  );
}

// ---------- Página ----------
type View = "inicio" | "partido" | "tema" | "invisible" | "metodo";

export function Escaner({ datos }: { datos: DatosEscaner }) {
  cargar(datos);
  const [view, setView] = useState<View>("inicio");
  const [stack, setStack] = useState<View[]>([]);
  const [fase, setFase] = useState<"idle" | "scanning" | "done">("idle");
  const [sort, setSort] = useState("votado");
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [openPr, setOpenPr] = useState<Set<string>>(new Set());
  const [pv, setPv] = useState<{ tema: string; partido: string } | null>(null);
  const [temaV, setTemaV] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [soloVotadas, setSoloVotadas] = useState(true);

  const show = (v: View) => { setStack((s) => [...s, view]); setView(v); window.scrollTo({ top: 0 }); };
  const back = () => { setStack((s) => { const n = [...s]; setView(n.pop() ?? "inicio"); return n; }); window.scrollTo({ top: 0 }); };
  const onToast = (m: string) => { setToast(m); setTimeout(() => setToast(""), 1600); };
  const scan = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setFase("done"); return; }
    setFase("scanning");
  };
  const onDone = useMemo(() => () => setFase("done"), []);
  const temasOrden = [...D.temas].sort((a, b) => SORTS[sort].key(b) - SORTS[sort].key(a));

  return (
    <div className="esc">
      <main className="gut">
        {view !== "inicio" && <button className="btn ghost back" type="button" onClick={back}><ArrowLeft />Volver</button>}

        {view === "inicio" && (
          <section>
            <p className="eyebrow">Congreso de los Diputados · XV legislatura</p>
            <h1>Escáner político</h1>
            <p className="lead">Pasamos por el escáner los programas electorales de 2023 de PP, PSOE, Sumar y Vox y comparamos cada frase con lo que votaron después en el Pleno.</p>
            <Scanner fase={fase} onScan={scan} onDone={onDone} />

            {fase === "done" && (
              <div className="reveal">
                <div className="tray" aria-hidden="true"><span className="slot" /></div>
                <div className="section">
                  <p className="label">{D.temas.length} temas encontrados · ordenar por</p>
                  <div className="seg" role="group" aria-label="Ordenar temas">
                    {Object.entries(SORTS).map(([k, s]) => (
                      <button key={k} className="btn outline" type="button" aria-pressed={sort === k} onClick={() => setSort(k)}>{s.label}</button>
                    ))}
                  </div>
                  <p className="small">{SORTS[sort].note}</p>
                </div>

                <div className="section tight">
                  <div className="legend"><span><i className="sw ok-bg" />A favor de lo que dice su programa</span><span><i className="sw bad-bg" />En contra</span><span><i className="sw nv-bg" />Abstención o dividido</span></div>                  <div className="topics">
                    {temasOrden.map((t, idx) => {
                      const isOpen = open.has(t.id), br = brecha(t.id), Icon = ICONS[t.id];
                      return (
                        <section className="card" key={t.id} id={`topic-${t.id}`} style={{ animationDelay: `${Math.min(idx, 20) * 70}ms` }}>
                          <button className="topic-head" type="button" aria-expanded={isOpen} aria-controls={`body-${t.id}`}
                            onClick={() => setOpen((s) => { const n = new Set(s); if (n.has(t.id)) n.delete(t.id); else n.add(t.id); return n; })}>
                            <span className="ico"><Icon /></span>
                            <span className="tn">{t.nombre}</span>
                            <span className="chev"><ChevronDown /></span>
                            <span className="metrics">
                              <span className={sort === "frases" ? "on" : ""}><b>{t.frases}</b> frases</span>
                              <span className={sort === "votado" ? "on" : ""}><b>{t.votaciones}</b> votaciones</span>
                              <span className={sort === "brecha" ? "on" : ""}>{br === null ? <>Brecha <b>—</b></> : <>En contra en <b>{br.partidos}</b> de {D.partidos.length} partidos · <b>{br.pct} %</b></>}</span>
                            </span>
                          </button>
                          {isOpen && (
                            <div className="topic-body" id={`body-${t.id}`}>
                              {D.partidos.map((p) => {
                                const c = resumen(t.id, p.id), pos = D.cortas[`${t.id}|${p.id}`] ?? "";
                                return (
                                  <button key={p.id} className="prow" type="button" onClick={() => { setPv({ tema: t.id, partido: p.id }); setOpenPr(new Set()); show("partido"); }}>
                                    <span className="pn"><i className="pdot" style={pc(p.color)} />{p.nombre}</span>
                                    <span className="ptx">{pos || "Su programa no trata el tema."}{pos && <span className="badge outline">IA</span>}</span>
                                    <span className="go"><ChevronRight /></span>
                                    {c.votos ? <Bar ok={c.ok} bad={c.bad} nv={c.nv} /> :<span className="bar-empty">{c.frases ? `${c.frases} frases, ninguna con votación ligada` : "Sin frases sobre el tema"}</span>}
                                  </button>
                                );
                              })}
                              <button className="topic-more" type="button" onClick={() => { setTemaV(t.id); show("tema"); }}>
                                <span>Cómo votó cada partido y cuánto pesa este tema</span><ChevronRight />
                              </button>
                            </div>
                          )}
                        </section>
                      );
                    })}
                  </div>
                  <p className="small">La posición de cada partido resume su programa y la ha escrito una IA (<span className="badge outline">IA</span>). Las frases son citas literales con su página.</p>
                  <div className="links">
                    <button className="btn outline" type="button" onClick={() => show("metodo")}>Cómo lo contamos</button>
                    <button className="btn outline" type="button" onClick={() => show("invisible")}>Lo que no se ve</button>
                  </div>
                </div>

                <div className="section"><Fuentes fuentes={[FUENTES.congreso, FUENTES.bocg, ...fuentesProgramas, FUENTES.escano]} /></div>
              </div>
            )}
          </section>
        )}

        {view === "partido" && pv && (() => {
          const t = temaById(pv.tema), p = partidoById(pv.partido), c = resumen(pv.tema, pv.partido);
          const all = itemsDe(pv.tema, pv.partido).sort((a, b) => a.x.pagina - b.x.pagina);
          const items = soloVotadas && c.votos ? all.filter((i) => i.es.length) : all;
          return (
            <section>
              <p className="eyebrow">{t.nombre} · <i className="pdot" style={pc(p.color)} />{p.nombre}</p>
              <h2 className="question">¿Qué decía {p.art} sobre {t.nombre.toLowerCase()} en 2023 y cómo votó?</h2>
              {D.posiciones[`${t.id}|${p.id}`] && (
                <div className="why" style={{ marginTop: 20 }}><div className="wl">Su posición en el programa <span className="badge outline">IA</span></div>{D.posiciones[`${t.id}|${p.id}`]}</div>
              )}
              {all.length ? <>
                <p className="sub">{c.vids.size} votaciones del Pleno ligadas a {all.length - c.sinVotar} de las {all.length} frases de su programa sobre el tema.</p>
                <div className="section program" style={pc(p.color)}>
                  <section className="card doc party">
                    <PageThumb items={all} />
                    <div className="doc-txt">
                      <span className="eyebrow" style={{ color: "var(--foreground)" }}>Programa electoral 2023</span>
                      <span className="doc-name">{p.full}</span>
                      <span className="small">{all.length} frases sobre {t.nombre.toLowerCase()}. Bajo cada una, sus votos a favor y en contra de lo que dice.</span>
                      <a href={PROGRAMAS[p.id].url} target="_blank" rel="noopener">Abrir el programa (PDF) ↗</a>
                    </div>
                  </section>
                  {c.sinVotar > 0 && c.votos > 0 && (
                    <div className="filters seg" role="group" aria-label="Qué frases mostrar">
                      <button className="btn outline" type="button" aria-pressed={soloVotadas} onClick={() => setSoloVotadas(true)}>Con votaciones ({all.length - c.sinVotar})</button>
                      <button className="btn outline" type="button" aria-pressed={!soloVotadas} onClick={() => setSoloVotadas(false)}>Todas ({all.length})</button>
                    </div>
                  )}
                  <div className="tree">
                    {items.map((i) => (
                      <Promesa key={i.x.id} i={i} p={p} open={openPr.has(i.x.id)} onToast={onToast}
                        onToggle={() => setOpenPr((s) => { const n = new Set(s); if (n.has(i.x.id)) n.delete(i.x.id); else n.add(i.x.id); return n; })} />
                    ))}
                  </div>
                </div>
              </> : <p className="sub">Su programa de 2023 no trata este tema.</p>}
              <div className="section">
                <section className="card where">
                  <div className="wt"><p className="small">Dónde se comprueba</p><h3>En los datos abiertos del Congreso</h3><p className="mono small">congreso.es</p></div>
                  <a className="btn sunset" href={FUENTES.congreso.url} target="_blank" rel="noopener">Ver las votaciones <span aria-hidden="true">↗</span></a>
                </section>
              </div>
              <div className="section"><Fuentes fuentes={[FUENTES.congreso, FUENTES.bocg, { nombre: `Programa electoral de 2023 · ${p.full}`, url: PROGRAMAS[p.id].url }, FUENTES.escano]} /></div>
            </section>
          );
        })()}

        {view === "tema" && temaV && (() => {
          const t = temaById(temaV);
          const maxProg = Math.max(...D.temas.map((x) => x.programa));
          const maxVot = Math.max(...D.temas.map((x) => x.votaciones / D.total));
          return (
            <section>
              <p className="eyebrow">{t.nombre}</p>
              <h2 className="question">¿Cómo votó cada partido en {t.nombre.toLowerCase()} y cuánto pesa el tema?</h2>
              <div className="section">
                <section className="card pad">
                  <h3 className="vt">Cómo votó cada partido</h3>
                  <p className="small">En las {t.votaciones} votaciones del Pleno sobre {t.nombre.toLowerCase()}, cuántas veces votó cada partido sí, no o se abstuvo. Son recuentos: no dicen si el voto fue a favor o en contra de su programa.</p>
                  <div className="legend"><span><i className="sw yes-bg" />Sí</span><span><i className="sw no-bg" />No</span><span><i className="sw ab-bg" />Abstención o dividido</span></div>
                  {D.partidos.map((p) => { const s = t.sentidos[p.id]; return (
                    <div className="pv" key={p.id}><span className="pn"><i className="pdot" style={pc(p.color)} />{p.nombre}</span><Bar ok={s.S} bad={s.N} nv={s.A + s.D} votos /></div>
                  ); })}
                </section>
              </div>
              <div className="section">
                <section className="card pad">
                  <h3 className="vt">Cuánto pesa el tema</h3>
                  <p className="small">Parte de los cuatro programas de 2023 dedicada a {t.nombre.toLowerCase()} (media, por palabras) frente a su parte de las {fmtN(D.total)} votaciones del Pleno.</p>
                  <div className="tb"><span className="lab">En los programas</span><div className="tr"><div className="fl" style={{ width: `${(t.programa / maxProg) * 100}%` }} /></div><span className="v">{fmtPct(t.programa * 100)}</span></div>
                  <div className="tb"><span className="lab">En las votaciones</span><div className="tr"><div className="fl" style={{ width: `${(t.votaciones / D.total / maxVot) * 100}%` }} /></div><span className="v">{fmtPct((t.votaciones / D.total) * 100)}</span></div>
                </section>
              </div>
              <div className="section"><Fuentes fuentes={[FUENTES.congreso, FUENTES.escano]} /></div>
            </section>
          );
        })()}

        {view === "invisible" && (() => {
          const peticiones = (D.tipos["Moción"] ?? 0) + (D.tipos["Proposición no de ley"] ?? 0);
          const nunca = ITEMS.filter((i) => !i.es.length).length;
          const viv = temaById("vivienda");
          return (
            <section>
              <p className="eyebrow">Lo que no se ve</p>
              <h2 className="question">Cuatro cosas que no salen en las noticias</h2>
              <div className="section">
                <div className="tiles">
                  <section className="card sun tile"><span className="n">{fmtPct((viv.votaciones / D.total) * 100)}</span><span className="t">de las votaciones del Pleno fueron sobre vivienda ({viv.votaciones} de {fmtN(D.total)}).</span></section>
                  <section className="card muted tile"><span className="n">{fmtPct((peticiones / D.total) * 100)}</span><span className="t">fueron mociones y proposiciones no de ley ({fmtN(peticiones)}): peticiones al Gobierno sin efecto legal.</span></section>
                  <section className="card muted tile"><span className="n">{fmtPct((D.amplias / D.total) * 100)}</span><span className="t">salieron con el 80 % o más de los votos emitidos a favor ({fmtN(D.amplias)}).</span></section>
                  <section className="card muted tile"><span className="n">{fmtPct((nunca / ITEMS.length) * 100)}</span><span className="t">de las {fmtN(ITEMS.length)} frases de los cuatro programas no tienen ninguna votación del Pleno que las cumpla o las contradiga.</span></section>
                </div>
              </div>
              <div className="section">
                <section className="card pad">
                  <h3 className="vt">Lo que pesa en los programas frente a lo que se vota</h3>
                  <p className="small">Los cinco temas con más votaciones: su parte de los cuatro programas de 2023 frente a su parte de las votaciones del Pleno.</p>
                  {[...D.temas].sort((a, b) => b.votaciones - a.votaciones).slice(0, 5).map((x) => (
                    <div key={x.id} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <p className="eyebrow">{x.nombre}</p>
                      <div className="tb"><span className="lab">En los programas</span><div className="tr"><div className="fl" style={{ width: `${Math.min(100, x.programa * 100 * 6)}%` }} /></div><span className="v">{fmtPct(x.programa * 100)}</span></div>
                      <div className="tb"><span className="lab">En las votaciones</span><div className="tr"><div className="fl" style={{ width: `${Math.min(100, (x.votaciones / D.total) * 100 * 6)}%` }} /></div><span className="v">{fmtPct((x.votaciones / D.total) * 100)}</span></div>
                    </div>
                  ))}
                </section>
              </div>
              <div className="section"><Fuentes fuentes={[FUENTES.congreso, FUENTES.escano]} /></div>
            </section>
          );
        })()}

        {view === "metodo" && (
          <section>
            <p className="eyebrow">Cómo lo contamos</p>
            <h2 className="question">Mismas reglas para todos</h2>
            <div className="section prose">
              <p>Leímos los programas de las generales de 2023 de PP, PSOE, Sumar y Vox tema a tema y sacamos {fmtN(ITEMS.length)} frases literales, cada una con su página. Cada frase se comparó con las votaciones del Pleno de su tema usando el texto oficial de lo que se votaba (Boletín Oficial de las Cortes), sin saber de qué partido era la frase ni cómo votó nadie. Cada enlace dice si la votación hace lo que dice la frase, va en esa dirección o la contradice.</p>
              <dl>
                <dt><i className="sw ok-bg" />A favor de lo que dice su programa</dt><dd>Votó sí a algo que va en la línea de la frase, o no a algo que la contradice.</dd>
                <dt><i className="sw bad-bg" />En contra</dt><dd>Al revés. Debajo va el motivo que dio el grupo en el debate, resumido por una IA.</dd>
                <dt><i className="sw nv-bg" />Abstención o dividido</dt><dd>El partido se abstuvo, o menos del 80 % de sus diputados votó lo mismo.</dd>
              </dl>
              <p>La posición de un partido es lo que votó la mayoría de los diputados elegidos en su candidatura de 2023. Una moción o proposición no de ley con varios puntos que se votó entera no cuenta para ninguna frase: el voto no se puede atribuir a uno de sus puntos. Las frases que ninguna votación trata salen como «Nunca se votó».</p>
              <p><b>Brecha dicho-hecho.</b> Por tema: en cuántos de los cuatro partidos hay algún voto en contra de lo que decía su programa y, de media entre los partidos con votos ligados, qué porcentaje de sus votos fue en contra. Las abstenciones y las frases que nunca se votaron no entran en la cifra.</p>
              <p><b>Neutralidad.</b> No ayuda a elegir partido: ni recomendaciones, ni tests de afinidad, ni encuestas, ni comparaciones de afinidad entre partidos. Los partidos van en orden alfabético y su color solo sirve para reconocerlos. El texto que escribe una IA va marcado con <span className="badge outline">IA</span> y nunca sirve para filtrar.</p>
              <p><b>Universo.</b> Las {fmtN(D.total)} votaciones del Pleno entre {fecha(D.desde)} y {fecha(D.hasta)}; {fmtN(D.conTema)} tienen tema. Las mociones y proposiciones no de ley son peticiones sin efecto legal.</p>
              <p><b>Límites.</b> La relación entre frase y votación la decide una IA con el texto oficial; puede equivocarse, sobre todo en enmiendas y en leyes largas, de las que solo se leyó el principio. Cada votación enlaza a su ficha oficial para comprobarlo.</p>
            </div>
            <div className="section"><Fuentes fuentes={[FUENTES.congreso, FUENTES.bocg, ...fuentesProgramas, FUENTES.escano]} /></div>
          </section>
        )}
      </main>
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}
