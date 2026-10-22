import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { votacion } from "./datos.ts";
import { iniciativasDeTema } from "./iniciativas.ts";
import { palabrasVetadas, problemasFrase, resumenDeTema } from "./resumenes.ts";

describe("resumenDeTema", () => {
  it("devuelve undefined si el tema no tiene resumen", () => {
    assert.equal(resumenDeTema("nope"), undefined);
  });

  it("veta valoraciones, pero no palabras de títulos oficiales", () => {
    assert.deepEqual(palabrasVetadas("El Grupo X fue coherente y nunca cedió"), ["coherente", "nunca"]);
    assert.deepEqual(palabrasVetadas("Informe para mejorar la atención; se incumplió"), ["incumpl"]);
  });

  it("descarta frases con grupos, fechas, recuentos o un resultado contrario a los datos", () => {
    assert.deepEqual(problemasFrase("Se votó una ley del Gobierno sobre el alquiler, y salió adelante.", true), []);
    assert.ok(problemasFrase("Se votó una ley del Grupo Parlamentario Popular, y no salió adelante.", false).length);
    assert.ok(problemasFrase("Votó en contra VOX y no salió adelante.", false).length);
    assert.ok(problemasFrase("El 2 de octubre no salió adelante.", false).length);
    assert.ok(problemasFrase("El decreto 27/2026 no salió adelante.", false).length);
    assert.ok(problemasFrase("No salió adelante por 184 votos.", false).length);
    assert.ok(problemasFrase("Se votó una ley y salió adelante.", false).length);
    assert.ok(problemasFrase("Se votó una ley y no salió adelante.", true).length);
  });

  const fichero = join(process.cwd(), "src", "datos", "resumenes", "vivienda.json");
  it("vivienda: una iniciativa del tema por frase, sin hechos inventados y con el resultado de los datos", { skip: !existsSync(fichero) }, () => {
    const r = resumenDeTema("vivienda");
    assert.ok(r && r.frases.length > 0 && r.frases.length <= 5);
    const porId = new Map(iniciativasDeTema("vivienda").map((i) => [i.id, i]));
    for (const f of r.frases) {
      assert.equal(f.iniciativas.length, 1, f.texto);
      const i = porId.get(f.iniciativas[0]);
      assert.ok(i, `${f.iniciativas[0]} no es de vivienda`);
      const t = votacion(i.votaciones[0].id)!.totales;
      assert.deepEqual(problemasFrase(f.texto, t.si > t.no), [], f.texto);
      assert.deepEqual(palabrasVetadas(f.texto), [], f.texto);
    }
  });
});
