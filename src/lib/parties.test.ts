import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, it } from "node:test";

type Party = { nombre: string; anteriores: string[]; color: string; fuente: string | null };

const read = async (...path: string[]) =>
  JSON.parse(await readFile(join(process.cwd(), ...path), "utf8"));

// Codes of the data that are not parties: the Grupo Mixto, the Government, the Mesa, guests, unknown.
const NOT_PARTIES = ["MIXTO", "GOB", "MESA", "COMP", "?"];

describe("parties map", () => {
  it("has an entry for every party group of the data, and none for the others", async () => {
    const parties = (await read("src", "config", "partidos.json")) as Record<string, Party>;
    const { grupos } = await read("data", "indice.json");
    const expected = Object.keys(grupos).filter((code) => !NOT_PARTIES.includes(code)).sort();
    assert.deepEqual(Object.keys(parties).sort(), expected);
  });

  it("gives each party a name, a hex colour and a source that is a URL or null", async () => {
    const parties = (await read("src", "config", "partidos.json")) as Record<string, Party>;
    for (const [code, party] of Object.entries(parties)) {
      assert.ok(party.nombre !== "", code);
      assert.match(party.color, /^#[0-9A-Fa-f]{6}$/, code);
      assert.ok(party.fuente === null || party.fuente.startsWith("https://"), code);
    }
  });
});
