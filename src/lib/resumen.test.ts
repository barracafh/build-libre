import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { partidos } from "./datos.ts";
import { posturasDeTema, temasConPosturas } from "./posturas.ts";
import { fraseMedida, frasePartido, resumenMedida, unirLista } from "./resumen.ts";

const PROHIBIDAS = /\b(apoya|rechaza|siempre|nunca)\b/i;

describe("resumen", () => {
  it("une listas en castellano", () => {
    assert.equal(unirLista([]), "");
    assert.equal(unirLista(["A"]), "A");
    assert.equal(unirLista(["A", "B"]), "A y B");
    assert.equal(unirLista(["A", "B", "C"]), "A, B y C");
  });

  it("fraseMedida de la primera medida de vivienda: «A favor:» y grupos en orden alfabético", () => {
    const fila = posturasDeTema("vivienda")[0];
    assert.ok(fila, "vivienda tiene posturas");
    const frase = fraseMedida(fila);
    assert.match(frase, /^A favor: /);
    const r = resumenMedida(fila);
    for (const lista of [r.aFavor, r.enContra, r.mixta, r.segunPunto, r.abstuvo, r.sinVoto]) {
      assert.deepEqual(lista, [...lista].sort((a, b) => a.localeCompare(b, "es")));
    }
    const total = r.aFavor.length + r.enContra.length + r.mixta.length + r.segunPunto.length + r.abstuvo.length + r.sinVoto.length;
    assert.equal(total, partidos().length);
  });

  it("frasePartido del PP menciona «en contra de regular»", () => {
    const frase = frasePartido(posturasDeTema("vivienda"), "PP");
    assert.ok(frase);
    assert.match(frase, /en contra de regular/);
  });

  it("frasePartido es null para un grupo sin posturas", () => {
    assert.equal(frasePartido(posturasDeTema("vivienda"), "NO-EXISTE"), null);
  });

  it("ninguna frase usa apoya, rechaza, siempre ni nunca", () => {
    for (const slug of temasConPosturas()) {
      const filas = posturasDeTema(slug);
      for (const f of filas) assert.doesNotMatch(fraseMedida(f), PROHIBIDAS);
      for (const p of partidos()) assert.doesNotMatch(frasePartido(filas, p.codigo) ?? "", PROHIBIDAS);
    }
  });
});
