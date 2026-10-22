import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { promesasDeTema, type Promesa } from "./promesas.ts";
import { ficheroPosturas, posturasDeTema, type Postura } from "./posturas.ts";
import { partidos } from "./datos.ts";
import {
  cumplimiento,
  cumplimientoPorFila,
  ETIQUETA_CUMPLIMIENTO,
  ficheroPromesasPosturas,
  PARTIDOS_CON_PROGRAMA,
  promesasPorEnunciado,
  type Cumplimiento,
  type PosturaPromesa,
  type PromesaAsignada,
} from "./promesas-posturas.ts";

const asignada = (postura: PosturaPromesa): PromesaAsignada => ({
  promesa: { id: "X-001-0001" } as Promesa,
  enunciado: "e",
  postura,
});

describe("cumplimiento", () => {
  const casos: [Postura, PosturaPromesa[], boolean, Cumplimiento][] = [
    ["F", ["F"], false, "sin-datos"],
    ["F", [], false, "sin-datos"],
    ["F", [], true, "sin-promesa"],
    ["S", [], true, "sin-promesa"],
    ["F", ["F"], true, "coincide"],
    ["C", ["C"], true, "coincide"],
    ["F", ["C"], true, "difiere"],
    ["C", ["F", "F"], true, "difiere"],
    ["F", ["F", "F", "C"], true, "coincide"],
    ["C", ["F", "F", "C"], true, "difiere"],
    ["F", ["F", "C"], true, "sin-votacion"],
    ["M", ["F"], true, "sin-votacion"],
    ["V", ["F"], true, "sin-votacion"],
    ["A", ["C"], true, "sin-votacion"],
    ["S", ["F"], true, "sin-votacion"],
  ];
  for (const [voto, ps, programa, esperado] of casos) {
    it(`voto ${voto}, promesas [${ps.join(",")}], programa ${programa} → ${esperado}`, () => {
      assert.equal(cumplimiento(voto, ps.map(asignada), programa), esperado);
    });
  }

  it("tiene etiqueta para cada resultado", () => {
    for (const c of ["coincide", "difiere", "sin-votacion", "sin-promesa", "sin-datos"] as Cumplimiento[])
      assert.ok(ETIQUETA_CUMPLIMIENTO[c]);
  });
});

describe("promesas-posturas/vivienda.json", () => {
  const fichero = ficheroPromesasPosturas("vivienda")!;
  const ids = new Set(Object.values(promesasDeTema("vivienda")).flat().map((p) => p.id));

  it("existe y es del tema", () => {
    assert.ok(fichero);
    assert.equal(fichero.tema, "vivienda");
  });

  it("solo usa promesas del tema", () => {
    for (const a of fichero.asignaciones) assert.ok(ids.has(a.promesa), a.promesa);
    for (const s of fichero.sinEnunciado ?? []) assert.ok(ids.has(s.promesa), s.promesa);
  });

  it("solo usa enunciados del tema", () => {
    const slugs = new Set(ficheroPosturas("vivienda")!.enunciados.map((e) => e.slug));
    for (const a of fichero.asignaciones) assert.ok(slugs.has(a.enunciado), a.enunciado);
    for (const k of Object.keys(promesasPorEnunciado("vivienda"))) assert.ok(slugs.has(k), k);
  });

  it("no asigna una promesa dos veces (ni la asigna y la deja sin enunciado)", () => {
    const todas = [...fichero.asignaciones.map((a) => a.promesa), ...(fichero.sinEnunciado ?? []).map((s) => s.promesa)];
    assert.equal(new Set(todas).size, todas.length);
  });

  it("revisa todas las promesas del tema", () => {
    const vistas = new Set([...fichero.asignaciones.map((a) => a.promesa), ...(fichero.sinEnunciado ?? []).map((s) => s.promesa)]);
    assert.deepEqual([...ids].filter((id) => !vistas.has(id)), []);
  });

  it("usa posturas F o C", () => {
    for (const a of fichero.asignaciones) assert.ok(a.postura === "F" || a.postura === "C", a.promesa);
  });
});

describe("promesasPorEnunciado", () => {
  it("es {} sin fichero", () => {
    assert.deepEqual(promesasPorEnunciado("no-existe"), {});
  });

  it("agrupa por partido en orden alfabético", () => {
    for (const porPartido of Object.values(promesasPorEnunciado("vivienda"))) {
      const ks = Object.keys(porPartido);
      assert.deepEqual(ks, [...ks].sort((a, b) => a.localeCompare(b, "es")));
      for (const [codigo, ps] of Object.entries(porPartido))
        for (const p of ps) assert.equal(promesasDeTema("vivienda")[codigo].some((x) => x.id === p.promesa.id), true);
    }
  });
});

describe("cumplimientoPorFila", () => {
  const codigos = new Set(partidos().map((p) => p.codigo));
  const conPrograma = PARTIDOS_CON_PROGRAMA("vivienda");

  it("PARTIDOS_CON_PROGRAMA de vivienda", () => {
    for (const c of ["BILDU", "PP", "PSOE"]) assert.ok(conPrograma.includes(c), c);
    assert.ok(!conPrograma.includes("VOX"));
  });

  for (const fila of posturasDeTema("vivienda")) {
    it(`${fila.enunciado.slug}: claves de partido y sin-datos solo sin programa`, () => {
      const r = cumplimientoPorFila(fila, "vivienda");
      const ks = Object.keys(r);
      assert.deepEqual(ks, [...ks].sort((a, b) => a.localeCompare(b, "es")));
      for (const k of ks) assert.ok(codigos.has(k), k);
      for (const c of ["PP", "PSOE", "BILDU"]) assert.notEqual(r[c].cumplimiento, "sin-datos", c);
      assert.equal(r.VOX.cumplimiento, "sin-datos");
    });
  }
});
