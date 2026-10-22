import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  agrupar,
  conteoPorPartido,
  cuestionesDeTema,
  patron,
  porIniciativa,
  tema,
  temas,
} from "./cuestiones.ts";
import { partidos, resumenes, TEMAS, type ResumenVotacion } from "./datos.ts";

const voto = (id: string, fecha: string, titulo: string, exp: string | null = null): ResumenVotacion => ({
  id,
  fecha,
  tipo: "Moción",
  titulo,
  exp,
  temas: ["vivienda"],
  partidos: {},
});

describe("patron", () => {
  it("ignora mayúsculas y tildes y busca al principio de palabra", () => {
    assert.ok(patron(["hipotec"]).test("creditos hipotecarios"));
    assert.ok(patron(["Ocupación ilegal"]).test("la ocupacion ilegal de inmuebles"));
    assert.ok(!patron(["IVA"]).test("vivienda privada"));
  });
});

describe("agrupar", () => {
  const reglas = [
    { slug: "alquiler", nombre: "Regulación del alquiler", palabras: ["alquiler"] },
    { slug: "suelo", nombre: "Suelo", palabras: ["suelo", "alquiler"] },
  ];

  it("lleva cada votación a la primera regla y el resto a «otras», sin cuestiones vacías", () => {
    const lista = [voto("1-1", "2024-01-01", "Alquiler y suelo"), voto("2-1", "2024-02-01", "Otra cosa")];
    const r = agrupar(lista, [...reglas, { slug: "vacia", nombre: "Vacía", palabras: ["nada"] }], new Map(), "Vivienda");
    assert.deepEqual(r.map((c) => [c.slug, c.votaciones.map((v) => v.id)]), [
      ["alquiler", ["1-1"]],
      ["otras", ["2-1"]],
    ]);
    assert.equal(r[1].nombre, "Otras votaciones sobre vivienda");
  });

  it("busca también en el texto", () => {
    const r = agrupar([voto("1-1", "2024-01-01", "Moción")], reglas, new Map([["1-1", "sobre el suelo"]]), "Vivienda");
    assert.equal(r[0].slug, "suelo");
  });

  it("sin reglas agrupa por iniciativa, la más reciente primero", () => {
    const r = porIniciativa([
      voto("5-1", "2024-01-01", "Ley A (punto 1)"),
      voto("5-2", "2024-01-01", "Ley A (punto 2)"),
      voto("9-1", "2024-03-01", "Ley B", "122/000001"),
      voto("8-1", "2024-02-01", "Ley B, enmiendas", "122/000001"),
    ]);
    assert.deepEqual(r.map((c) => [c.nombre, c.votaciones.map((v) => v.id)]), [
      ["Ley B", ["9-1", "8-1"]],
      ["Ley A", ["5-2", "5-1"]],
    ]);
  });
});

describe("cuestionesDeTema", () => {
  it("pone cada votación de vivienda en una sola cuestión", () => {
    const ids = resumenes().filter((v) => v.temas.includes("vivienda")).map((v) => v.id);
    const agrupados = cuestionesDeTema("vivienda").flatMap((c) => c.votaciones.map((v) => v.id));
    assert.equal(agrupados.length, ids.length);
    assert.deepEqual(new Set(agrupados), new Set(ids));
  });

  it("no devuelve cuestiones vacías y ordena las votaciones de la más reciente a la más antigua", () => {
    for (const slug of Object.keys(TEMAS)) {
      for (const c of cuestionesDeTema(slug)) {
        assert.ok(c.votaciones.length, `${slug}/${c.slug} vacía`);
        const fechas = c.votaciones.map((v) => v.fecha);
        assert.deepEqual(fechas, [...fechas].sort().reverse());
      }
    }
  });

  it("no repite slugs dentro de un tema", () => {
    for (const slug of Object.keys(TEMAS)) {
      const slugs = cuestionesDeTema(slug).map((c) => c.slug);
      assert.equal(new Set(slugs).size, slugs.length, slug);
    }
  });

  it("devuelve una lista vacía para un tema que no existe", () => {
    assert.deepEqual(cuestionesDeTema("nada"), []);
  });
});

describe("temas", () => {
  it("son los 21 en orden alfabético, con sus recuentos", () => {
    const t = temas();
    assert.equal(t.length, Object.keys(TEMAS).length);
    assert.deepEqual(t.map((x) => x.nombre), t.map((x) => x.nombre).sort((a, b) => a.localeCompare(b, "es")));
    const vivienda = tema("vivienda");
    assert.equal(vivienda?.votaciones, resumenes().filter((v) => v.temas.includes("vivienda")).length);
    assert.equal(vivienda?.cuestiones, cuestionesDeTema("vivienda").length);
    assert.equal(tema("nada"), undefined);
  });
});

describe("conteoPorPartido", () => {
  it("solo tiene grupos de partidos(), con las cinco posiciones, y cada fila suma el total", () => {
    const lista = cuestionesDeTema("vivienda").flatMap((c) => c.votaciones);
    const conteo = conteoPorPartido(lista);
    assert.deepEqual(Object.keys(conteo), partidos().map((p) => p.codigo));
    for (const c of Object.values(conteo)) {
      assert.deepEqual(Object.keys(c).sort(), ["A", "D", "N", "S", "X"]);
      assert.equal(c.S + c.N + c.A + c.X + c.D, lista.length);
    }
  });
});
