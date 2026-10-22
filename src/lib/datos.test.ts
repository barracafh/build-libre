import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import {
  datosTemas,
  decodificarVotos,
  esEnmienda,
  partidos,
  posicionPartido,
  provincias,
  resultados2023,
  resumenes,
  TEMAS,
  temasDe,
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

describe("temasDe", () => {
  it("folds defensa into exteriores and drops tags outside TEMAS", () => {
    assert.deepEqual(temasDe(["defensa", "exteriores", "cultura", "vivienda"]), ["exteriores", "vivienda"]);
  });
});

describe("esEnmienda", () => {
  it("tells amendment votes from main votes, amendments to the whole text included as main", () => {
    assert.ok(esEnmienda("Movilidad Sostenible (enmiendas 77, 85 y 137)"));
    assert.ok(esEnmienda("Ley X (resto de las enmiendas)"));
    assert.ok(esEnmienda("Ley X (votación en bloque de las enmiendas)"));
    assert.ok(!esEnmienda("Vivienda (punto 3)"));
    assert.ok(!esEnmienda("Votación conjunta de las enmiendas a la totalidad de devolución al Proyecto"));
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

  it("groups a topic's votes into initiatives, amendments apart", () => {
    const d = datosTemas();
    const movilidad = d.iniciativas["121/000009"];
    assert.equal(movilidad.votaciones.length + movilidad.enmiendas.length, 141);
    assert.ok(movilidad.votaciones.every((v) => !esEnmienda(v.titulo)));
    // Same motion voted by points, no expediente: one initiative.
    assert.deepEqual(d.iniciativas["132-16"].votaciones.map((v) => v.id), ["132-16", "132-17", "132-18", "132-19"]);
    const vivienda = d.temas.find((t) => t.slug === "vivienda")!;
    assert.deepEqual(vivienda.recuento, { iniciativas: 29, votaciones: 86, enmiendas: 0 });
  });

  it("files every vote with a topic under that topic, once", () => {
    const d = datosTemas();
    const vistas = new Map<string, string[]>();
    for (const t of d.temas)
      for (const clave of t.iniciativas) {
        const i = d.iniciativas[clave];
        for (const v of [...i.votaciones, ...i.enmiendas]) vistas.set(v.id, [...(vistas.get(v.id) ?? []), t.slug]);
      }
    for (const v of votaciones())
      for (const t of v.temas) assert.equal(vistas.get(v.id)?.filter((s) => s === t).length, 1, `${v.id} ${t}`);
    const conTema = new Set([...vistas.keys()]).size;
    assert.equal(conTema + d.sinTema.votaciones, votaciones().length);
  });

  it("matches the committed data/temas.json (regenerate with node scripts/temas.ts)", () => {
    const enDisco = JSON.parse(readFileSync("data/temas.json", "utf8"));
    assert.deepEqual(enDisco, JSON.parse(JSON.stringify(datosTemas())));
  });

  it("adds up to 350 seats in 2023, candidacies in alphabetical order", () => {
    const todas = provincias().map((p) => resultados2023(p.codigo)!);
    assert.equal(todas.reduce((s, r) => s + r.escanos, 0), 350);
    const siglas = todas[0].candidaturas.map((c) => c.siglas);
    assert.deepEqual(siglas, [...siglas].sort((a, b) => a.localeCompare(b, "es")));
  });
});
