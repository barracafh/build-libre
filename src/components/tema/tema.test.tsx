import assert from "node:assert/strict";
import { it } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";

import { temas } from "@/lib/datos";
import { Matriz } from "./matriz";
import { VistaTema } from "./vista-tema";

const datos = temas();
const enmienda = datos.iniciativas["59-3"];

it("keeps amendment-only initiatives visible before filtering", () => {
  const html = renderToStaticMarkup(<VistaTema iniciativas={[enmienda]} partidos={datos.partidos} />);
  assert.ok(html.includes('id="ini-59-3"'));
});

it("links the official amendment votes in an open initiative", () => {
  const html = renderToStaticMarkup(
    <Matriz iniciativas={[enmienda]} partidos={datos.partidos} abiertas={new Set([enmienda.clave])} alternar={() => {}} />,
  );
  assert.ok(html.includes(enmienda.enmiendas[0].fuente));
});

it("shows every dated party explanation with its official vote", () => {
  const iniciativa = datos.iniciativas["154/000006"];
  const html = renderToStaticMarkup(
    <Matriz iniciativas={[iniciativa]} partidos={datos.partidos} abiertas={new Set([iniciativa.clave])} alternar={() => {}} />,
  );
  for (const voto of iniciativa.votaciones) {
    const motivo = voto.motivos.VOX;
    assert.ok(motivo);
    assert.ok(html.includes(motivo.texto), voto.id);
    assert.ok(html.includes(voto.fuente), voto.id);
  }
});
