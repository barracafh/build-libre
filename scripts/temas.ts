// Writes data/temas.json: the votes of each topic grouped into initiatives (`datosTemas` in
// src/lib/datos.ts), so the topic pages read one file. Run by `bun run data:fetch` after the
// download; run it alone after changing the grouping rules.
//
// Usage: node scripts/temas.ts

import { writeFileSync } from "node:fs";
import { join } from "node:path";

import { datosTemas } from "../src/lib/datos.ts";

const datos = datosTemas();
writeFileSync(join(process.cwd(), "data", "temas.json"), `${JSON.stringify(datos, null, 1)}\n`);
console.log(`Wrote data/temas.json: ${Object.keys(datos.iniciativas).length} initiatives in ${datos.temas.length} topics`);
