import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  Buscador,
  anonimo,
  barajar,
  citaLiteral,
  idUnidad,
  limpiarPaginas,
  paginaDeId,
  partir,
  promesasDeTema,
  tandas,
  unidades,
} from "./promesas.ts";

const LARGA = "Aprobaremos una ley estatal de vivienda que limite el precio del alquiler en zonas tensionadas";

describe("limpiarPaginas y unidades", () => {
  // Cinco páginas con la misma cabecera y su número: la cabecera y los números se van, y cualquier otra línea
  // corta repetida en más de 3 páginas también (por eso cada línea de texto lleva el número de página).
  const crudas = Array.from({ length: 5 }, (_, i) =>
    [
      "PROGRAMA ELECTORAL 2023",
      "",
      `Párrafo de la página ${i + 1} que tiene bastantes palabras para contar como unidad completa del`,
      `texto ${i + 1} y sigue en otra línea con una pala-`,
      `bra partida al final de la página ${i + 1}.`,
      "",
      `1. ${LARGA} ${i + 1}.`,
      `• Crearemos un fondo de garantía ${i + 1} para el alquiler de jóvenes menores de treinta y cinco años.`,
      "Corto",
      "Índice de materias ........ 12",
      String(i + 1),
    ].join("\n"),
  );
  const paginas = limpiarPaginas(crudas);
  const us = unidades(paginas, "PP");

  it("quita cabeceras repetidas, números de página, viñetas e índices", () => {
    assert.ok(!paginas[0].includes("PROGRAMA ELECTORAL"));
    assert.ok(!/\n\n1\n?$/.test(paginas[0]));
    assert.ok(!paginas[0].includes("•"));
    assert.ok(!paginas[0].includes("Índice"));
  });

  it("une las líneas de un párrafo y repara las palabras partidas con guion", () => {
    assert.match(us[0].texto, /^Párrafo de la página 1 .* texto 1 y sigue en otra línea con una palabra partida al final de la página 1\.$/);
  });

  it("corta en puntos numerados y viñetas y descarta lo de menos de 8 palabras", () => {
    const pagina1 = us.filter((u) => u.pagina === 1).map((u) => u.texto);
    assert.equal(pagina1.length, 3);
    assert.equal(pagina1[1], `${LARGA} 1.`);
    assert.match(pagina1[2], /^Crearemos un fondo/);
    assert.ok(!pagina1.includes("Corto"));
  });

  it("numera las unidades sobre todo el documento con SIGLA-PPP-NNNN", () => {
    assert.deepEqual(
      us.slice(0, 4).map((u) => u.id),
      ["PP-001-0001", "PP-001-0002", "PP-001-0003", "PP-002-0004"],
    );
    assert.equal(us.at(-1)!.id, "PP-005-0015");
  });

  it("parte los bloques de más de 1100 caracteres por frases", () => {
    const frase = "Esta es una frase de prueba que tiene unas cuantas palabras y acaba en punto. ";
    const trozos = partir(frase.repeat(40).trim());
    assert.ok(trozos.length > 1);
    assert.ok(trozos.every((t) => [...t].length <= 1100));
    assert.equal(trozos.join(" "), frase.repeat(40).trim());
  });

  it("hace tandas de unas 7000 letras sin partir unidades", () => {
    const u = (n: number) => ({ id: idUnidad("PP", 1, n), pagina: 1, texto: "x".repeat(3000) });
    assert.deepEqual(
      tandas([u(1), u(2), u(3)]).map((t) => t.length),
      [2, 1],
    );
  });
});

describe("citaLiteral", () => {
  const texto = "En materia de vivienda, «aprobaremos una ley estatal» que limite el pre-\n cio del alquiler.";
  it("acepta la cita copiada aunque cambien comillas, mayúsculas, espacios y guiones de fin de línea", () => {
    assert.ok(citaLiteral('"Aprobaremos una ley estatal" que limite el precio del alquiler.', texto));
  });
  it("rechaza una cita que no está en el texto o que es demasiado corta", () => {
    assert.ok(!citaLiteral("aprobaremos una ley estatal que suprima el alquiler", texto));
    assert.ok(!citaLiteral("una ley estatal", texto));
  });
});

describe("ids", () => {
  it("rellena la página a 3 cifras y el contador a 4, y se leen de vuelta", () => {
    assert.equal(idUnidad("PSOE", 7, 42), "PSOE-007-0042");
    assert.equal(paginaDeId("PSOE-007-0042"), 7);
    assert.equal(paginaDeId("PP-072-0304"), 72);
    assert.equal(paginaDeId("otra-cosa"), null);
  });
});

describe("buscador y juicio a ciegas", () => {
  it("BM25 pone primero la iniciativa que comparte las palabras de la promesa", () => {
    const docs = [
      { id: "a", t: "Proposición sobre pesca en el Cantábrico" },
      { id: "b", t: "Ley por el derecho a la vivienda y el alquiler asequible" },
      { id: "c", t: "Moción sobre defensa nacional" },
    ];
    const b = new Buscador(docs, (d) => d.t);
    assert.equal(b.buscar("limitar el precio del alquiler de vivienda")[0].id, "b");
  });
  it("anonimiza los grupos y baraja de forma determinista", () => {
    assert.equal(anonimo("Moción del Grupo Parlamentario Popular en el Congreso y PSOE"), "Moción del [GRUPO]");
    const xs = Array.from({ length: 12 }, (_, i) => i);
    assert.deepEqual(barajar(xs, "PP-001-0001"), barajar(xs, "PP-001-0001"));
    assert.deepEqual([...barajar(xs, "PP-001-0001")].sort((a, b) => a - b), xs);
  });
});

describe("promesasDeTema", () => {
  const vivienda = promesasDeTema("vivienda");
  for (const partido of ["PP", "PSOE"]) {
    it(`devuelve promesas de vivienda de ${partido} con página y enlace a la página del PDF`, () => {
      const lista = vivienda[partido] ?? [];
      assert.ok(lista.length > 0);
      for (const p of lista) {
        assert.equal(p.tema, "vivienda");
        assert.equal(p.pagina, paginaDeId(p.id));
        assert.ok(p.fuente.endsWith(`#page=${p.pagina}`));
      }
      // Sin fichero propio, vienen de la caché de upstream.
      if (!existsSync(join(process.cwd(), "src", "datos", "promesas", `${partido}.json`)))
        assert.ok(lista.every((p) => p.origen === "cache-upstream"));
    });
  }
  it("no incluye BNG ni UPN", () => {
    assert.ok(!("UPN" in vivienda) && !("BNG" in vivienda));
  });
});
