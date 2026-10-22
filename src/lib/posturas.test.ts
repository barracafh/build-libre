import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { partidos } from "./datos.ts";
import { iniciativasDeTema, type PosicionIniciativa } from "./iniciativas.ts";
import { ficheroPosturas, postura, posturasDeTema, sentido, temasConPosturas, type Postura } from "./posturas.ts";

describe("sentido", () => {
  const casos: [PosicionIniciativa, 1 | -1, string][] = [
    ["S", 1, "F"],
    ["S", -1, "C"],
    ["N", 1, "C"],
    ["N", -1, "F"],
    ["A", 1, "A"],
    ["A", -1, "A"],
    ["D", 1, "V"],
    ["V", -1, "V"],
    ["X", 1, "X"],
    ["X", -1, "X"],
  ];
  for (const [posicion, direccion, esperado] of casos) {
    it(`${posicion} con dirección ${direccion} es ${esperado}`, () => {
      assert.equal(sentido(posicion, direccion), esperado);
    });
  }
});

describe("postura", () => {
  const casos: [number, number, number, number, Postura][] = [
    [2, 0, 0, 0, "F"],
    [1, 0, 3, 2, "F"],
    [0, 1, 0, 0, "C"],
    [0, 2, 1, 1, "C"],
    [1, 1, 0, 0, "M"],
    [3, 1, 2, 1, "M"],
    [0, 0, 2, 0, "A"],
    [0, 0, 1, 3, "A"],
    [0, 0, 0, 1, "V"],
    [0, 0, 0, 0, "S"],
  ];
  for (const [aFavor, enContra, abstencion, otras, esperado] of casos) {
    it(`${aFavor} a favor, ${enContra} en contra, ${abstencion} abstención, ${otras} otras es ${esperado}`, () => {
      assert.equal(postura({ aFavor, enContra, abstencion, otras }), esperado);
    });
  }
});

describe("posturas de vivienda", () => {
  const fichero = ficheroPosturas("vivienda")!;
  const ids = new Set(iniciativasDeTema("vivienda").map((i) => i.id));
  const codigos = partidos().map((p) => p.codigo);

  it("tiene fichero y aparece en temasConPosturas", () => {
    assert.ok(fichero);
    assert.ok(temasConPosturas().includes("vivienda"));
  });

  it("solo asigna iniciativas que existen en el tema", () => {
    for (const a of fichero.asignaciones) assert.ok(ids.has(a.iniciativa), a.iniciativa);
    for (const s of fichero.sinEnunciado ?? []) assert.ok(ids.has(s.iniciativa), s.iniciativa);
  });

  it("solo usa enunciados que existen, con slugs únicos", () => {
    const slugs = fichero.enunciados.map((e) => e.slug);
    assert.equal(new Set(slugs).size, slugs.length);
    for (const a of fichero.asignaciones) assert.ok(slugs.includes(a.enunciado), a.enunciado);
  });

  it("no asigna una iniciativa dos veces, ni la pone a la vez en sinEnunciado", () => {
    const todas = [...fichero.asignaciones, ...(fichero.sinEnunciado ?? [])].map((a) => a.iniciativa);
    assert.equal(new Set(todas).size, todas.length);
  });

  it("cubre todas las iniciativas del tema", () => {
    const cubiertas = new Set([...fichero.asignaciones, ...(fichero.sinEnunciado ?? [])].map((a) => a.iniciativa));
    assert.deepEqual([...ids].filter((id) => !cubiertas.has(id)), []);
  });

  it("da una postura por grupo en cada enunciado, en orden del fichero", () => {
    const filas = posturasDeTema("vivienda");
    assert.deepEqual(
      filas.map((f) => f.enunciado.slug),
      fichero.enunciados.map((e) => e.slug),
    );
    for (const f of filas) {
      assert.deepEqual(Object.keys(f.porPartido).sort(), [...codigos].sort());
      for (const [codigo, p] of Object.entries(f.porPartido)) {
        assert.ok(["F", "C", "M", "A", "V", "S"].includes(p.postura), `${f.enunciado.slug} ${codigo}`);
        assert.equal(p.aFavor + p.enContra + p.abstencion + p.otras, p.pruebas.length);
        const fechas = p.pruebas.map((x) => x.iniciativa.fecha);
        assert.deepEqual(fechas, [...fechas].sort().reverse());
      }
    }
  });
});

describe("postura según el punto en vivienda", () => {
  const fila = (slug: string) => posturasDeTema("vivienda").find((f) => f.enunciado.slug === slug)!;
  it("marca V a quien solo votó dividido o según el punto", () => {
    assert.equal(fila("suspension-desahucios").porPartido.PNV.postura, "V");
    assert.equal(fila("parque-publico").porPartido.PP.postura, "V");
    assert.equal(fila("parque-publico").porPartido.JUNTS.postura, "V");
  });
});

describe("posturasDeTema sin fichero", () => {
  it("devuelve []", () => {
    assert.deepEqual(posturasDeTema("nope"), []);
    assert.ok(!temasConPosturas().includes("nope"));
  });
});
