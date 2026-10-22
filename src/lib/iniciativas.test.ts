import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { cuestionesDeTema, type Cuestion } from "./cuestiones.ts";
import { partidos, resumenes, type Posicion, type ResumenVotacion } from "./datos.ts";
import {
  apoyoPorPartido,
  fraseApoyo,
  iniciativasDeCuestion,
  iniciativasDeTema,
  iniciativasDeVotaciones,
} from "./iniciativas.ts";

// Ids que no existen en los datos, para que no se cuele un proponente real.
const voto = (id: string, titulo: string, p: Record<string, Posicion>, exp: string | null = null): ResumenVotacion => ({
  id,
  fecha: "2024-01-01",
  tipo: "Moción",
  titulo,
  exp,
  temas: ["vivienda"],
  partidos: p,
});

describe("iniciativasDeTema", () => {
  const vivienda = resumenes().filter((v) => v.temas.includes("vivienda"));
  const iniciativas = iniciativasDeTema("vivienda");

  it("pone cada votación de vivienda en una sola iniciativa, con menos iniciativas que votaciones", () => {
    const ids = iniciativas.flatMap((i) => i.votaciones.map((v) => v.id));
    assert.equal(ids.length, vivienda.length);
    assert.deepEqual(new Set(ids), new Set(vivienda.map((v) => v.id)));
    assert.ok(iniciativas.length < vivienda.length);
  });

  it("junta las votaciones por puntos en una iniciativa", () => {
    const porPuntos = iniciativas.filter((i) => i.votaciones.some((v) => /\(punto \d+/i.test(v.titulo)));
    assert.ok(porPuntos.length);
    for (const i of porPuntos) {
      assert.ok(i.votaciones.length >= 2, i.id);
      assert.ok(!/\((punto|resto)/i.test(i.titulo), i.titulo);
    }
  });

  it("no deja títulos cortados con «…»", () => {
    for (const i of iniciativas) assert.ok(!/(…|\.\.\.)\s*$/.test(i.titulo), i.titulo);
  });

  it("ordena de la más reciente a la más antigua", () => {
    const fechas = iniciativas.map((i) => i.fecha);
    assert.deepEqual(fechas, [...fechas].sort().reverse());
  });
});

describe("posiciones", () => {
  const [i] = iniciativasDeVotaciones([
    voto("x-1", "Moción A (punto 1)", { PP: "S", VOX: "S", PSOE: "S", MIXTO: "S" }),
    voto("x-2", "Moción A (punto 2)", { PP: "S", VOX: "N", PSOE: "D" }),
  ]);

  it("solo tiene grupos de partidos()", () => {
    assert.deepEqual(Object.keys(i.posiciones), partidos().map((p) => p.codigo));
    assert.equal(i.titulo, "Moción A");
    assert.equal(i.id, "votacion-x-2");
  });

  it("S en todos los puntos es S, mezcla es V, cualquier D es D", () => {
    assert.equal(i.posiciones.PP, "S");
    assert.equal(i.posiciones.VOX, "V");
    assert.equal(i.posiciones.PSOE, "D");
    assert.equal(i.posiciones.ERC, "X");
  });
});

describe("apoyoPorPartido", () => {
  it("pone cada iniciativa en una sola lista por grupo, con los grupos en orden alfabético", () => {
    const iniciativas = iniciativasDeTema("vivienda");
    const apoyo = apoyoPorPartido(iniciativas);
    assert.deepEqual(Object.keys(apoyo), partidos().map((p) => p.codigo));
    for (const a of Object.values(apoyo)) {
      const ids = Object.values(a).flatMap((l) => l.map((x) => x.id));
      assert.equal(ids.length, iniciativas.length);
      assert.equal(new Set(ids).size, iniciativas.length);
    }
  });
});

describe("fraseApoyo", () => {
  const cuestion = cuestionesDeTema("vivienda").find((c) => c.slug === "desahucios-ocupacion")!;

  it("da el número de votaciones de la cuestión", () => {
    const frase = fraseApoyo("PP", cuestion);
    assert.ok(frase?.includes(`${cuestion.votaciones.length} votaci`), frase ?? "");
  });

  it("es null sin votaciones", () => {
    const vacia: Cuestion = { slug: "vacia", nombre: "Nada", votaciones: [] };
    assert.equal(fraseApoyo("PP", vacia), null);
  });

  it("no usa palabras valorativas", () => {
    for (const c of cuestionesDeTema("vivienda")) {
      for (const { codigo } of partidos()) {
        const frase = fraseApoyo(codigo, c) ?? "";
        assert.ok(!/apoya|rechaza|coherente|defiende|siempre|nunca/i.test(frase), frase);
      }
    }
  });
});

describe("iniciativasDeCuestion", () => {
  it("cubre todas las votaciones de la cuestión", () => {
    for (const c of cuestionesDeTema("vivienda")) {
      const n = iniciativasDeCuestion(c).reduce((s, i) => s + i.votaciones.length, 0);
      assert.equal(n, c.votaciones.length);
    }
  });
});
