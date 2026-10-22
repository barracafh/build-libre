import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { partidos } from "./datos.ts";
import { propuestasDeTema } from "./propuestas.ts";

describe("propuestasDeTema", () => {
  const vivienda = propuestasDeTema("vivienda");
  const codigos = partidos().map((p) => p.codigo);

  it("solo devuelve grupos de partidos(), en su orden", () => {
    const claves = Object.keys(vivienda);
    assert.ok(claves.length);
    assert.deepEqual(claves, codigos.filter((c) => claves.includes(c)));
    for (const fuera of ["GOB", "MIXTO", "MESA"]) assert.ok(!(fuera in vivienda));
  });

  it("ordena las líneas de más a menos menciones y enlaza el Diario cuando se conoce", () => {
    for (const lineas of Object.values(vivienda)) {
      const n = lineas.map((l) => l.n);
      assert.deepEqual(n, [...n].sort((a, b) => b - a));
    }
    const citas = Object.values(vivienda).flatMap((ls) => ls.flatMap((l) => l.citas));
    assert.ok(citas.some((c) => c.diario?.startsWith("https://www.congreso.es/")));
  });

  it("devuelve un objeto vacío para un tema que no existe", () => {
    assert.deepEqual(propuestasDeTema("nada"), {});
  });
});
