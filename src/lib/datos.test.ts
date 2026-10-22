import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  decodificarVotos,
  partidos,
  posicionPartido,
  provincias,
  resultados2023,
  resumenes,
  TEMAS,
  votacion,
  votaciones,
  votosDiputados,
} from "./datos.ts";

describe("posicionPartido", () => {
  it("takes the most voted option when it reaches 80 % of the votes cast", () => {
    assert.equal(posicionPartido({ S: 8, N: 2, X: 5 }).posicion, "S");
  });

  it("is divided below 80 % and keeps the majority option", () => {
    assert.deepEqual(posicionPartido({ N: 7, S: 3 }), {
      posicion: "D",
      mayoritario: "N",
      conteo: { S: 3, N: 7, A: 0, X: 0 },
    });
  });

  it("is X when nobody voted, so absences never count as a position", () => {
    assert.deepEqual(posicionPartido({ X: 5 }).posicion, "X");
  });
});

describe("decodificarVotos", () => {
  it("skips non-deputies and applies the group override", () => {
    const filas = [
      ["A, Ana", "PSOE", "Madrid", "PSOE", "", 0, 0, 1, ""],
      ["B, Bea", "SUMAR", "Cádiz", "SUMAR", "", 0, 0, 2, ""],
      ["C, Carlos", "PP", "Lugo", "PP", "", 0, 0, 3, ""],
    ] as Parameters<typeof decodificarVotos>[1];
    const votos = decodificarVotos({ v: "S-X", cg: { "2": "MIXTO" } }, filas);
    assert.deepEqual(
      votos.map((d) => [d.nombre, d.grupo, d.voto]),
      [
        ["A, Ana", "PSOE", "S"],
        ["C, Carlos", "MIXTO", "X"],
      ],
    );
  });
});

describe("snapshot", () => {
  it("keeps every vote, with only party groups and known topics", () => {
    const codigos = partidos().map((p) => p.codigo);
    assert.equal(votaciones().length, 2185);
    for (const v of votaciones()) {
      for (const c of [...Object.keys(v.partidos), ...Object.keys(v.motivos)])
        assert.ok(codigos.includes(c), `${v.id} ${c}`);
      for (const t of v.temas) assert.ok(t in TEMAS, `${v.id} ${t}`);
      assert.ok(v.fuente.startsWith("https://www.congreso.es/"), v.id);
      assert.notEqual(v.proponente, "?");
    }
  });

  it("lists parties and provinces alphabetically", () => {
    const nombres = partidos().map((p) => p.nombre);
    assert.deepEqual(nombres, [...nombres].sort((a, b) => a.localeCompare(b, "es")));
    assert.equal(provincias().length, 52);
  });

  it("decodes one vote per deputy in office, matching the official totals", () => {
    const v = votacion("27-1")!;
    const votos = votosDiputados("27-1");
    const n = (voto: string) => votos.filter((d) => d.voto === voto).length;
    assert.deepEqual([n("S"), n("N"), n("A"), n("X")], [v.totales.si, v.totales.no, v.totales.abstencion, v.totales.noVota]);
  });

  it("gives the client a summary for every vote", () => {
    assert.equal(resumenes().length, votaciones().length);
  });

  it("adds up to 350 seats in 2023, candidacies in alphabetical order", () => {
    const todas = provincias().map((p) => resultados2023(p.codigo)!);
    assert.equal(todas.reduce((s, r) => s + r.escanos, 0), 350);
    const siglas = todas[0].candidaturas.map((c) => c.siglas);
    assert.deepEqual(siglas, [...siglas].sort((a, b) => a.localeCompare(b, "es")));
  });
});
