// Genera src/config/sintesis.json: por grupo y tema, la síntesis de las razones
// de voto (texto generado por un modelo). Se puede relanzar: salta lo ya hecho.
//   node --env-file=.env.local scripts/sintesis.ts
import { readFile, writeFile } from "node:fs/promises";
import { cruzar, recuentos } from "../src/lib/cruce.ts";
import { sintetizar } from "../src/lib/sintesis.ts";

const SALIDA = "src/config/sintesis.json";
const PARALELO = 6;

const partidos: Record<string, { nombre: string }> = JSON.parse(
  await readFile("src/config/partidos.json", "utf8"),
);
const hecho: Record<string, string> = await readFile(SALIDA, "utf8")
  .then(JSON.parse)
  .catch(() => ({}));

const tabla = await recuentos();
const celdas = Object.keys(tabla).flatMap((tema) =>
  Object.keys(partidos)
    .filter((g) => tabla[tema][g] && !hecho[`${g}|${tema}`])
    .map((g) => ({ g, tema })),
);
console.log(`${celdas.length} celdas por generar`);

async function trabajar() {
  for (let c = celdas.pop(); c; c = celdas.pop()) {
    const { razones } = await cruzar(c.g, c.tema);
    const texto = await sintetizar(partidos[c.g].nombre, c.tema, razones);
    if (!texto) {
      console.log(`sin síntesis: ${c.g} ${c.tema} (${razones.length} razones)`);
      continue;
    }
    hecho[`${c.g}|${c.tema}`] = texto;
    await writeFile(SALIDA, JSON.stringify(hecho, null, 1));
    console.log(`ok ${c.g} ${c.tema}`);
  }
}
await Promise.all(Array.from({ length: PARALELO }, trabajar));
console.log(`${Object.keys(hecho).length} síntesis en ${SALIDA}`);
