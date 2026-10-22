# Prueba: promesas de vivienda frente a votos (22/10/2026)

Prueba del método de `escano/promesas.py` (Escaño Abierto) con un solo tema. Mide qué votó cada
candidatura sobre lo que prometió en vivienda; no mide si la promesa se cumplió. Análisis interno:
no es para mostrarlo en la herramienta (las normas prohíben resúmenes de programas).

## Resultado

147 promesas de 10 programas; 51 con al menos una votación que la cumple, avanza o contradice.

| Partido | Promesas | Votó a favor de lo prometido¹ | Votó en contra de lo prometido² | Abstención o dividido | Sin votación relacionada |
| --- | --- | --- | --- | --- | --- |
| EH Bildu | 3 | 1 | 0 | 0 | 2 |
| BNG | 9 | 3 | 0 | 0 | 6 |
| ERC | 15 | 4 | 1 | 0 | 10 |
| Junts | 20 | 5 | 1 | 0 | 14 |
| PNV | 1 | 1 | 0 | 0 | 0 |
| PP | 14 | 7 | 0 | 1 | 6 |
| PSOE | 31 | 2 | 1 | 6 | 22 |
| Sumar | 37 | 7 | 1 | 0 | 29 |
| UPN | 2 | 2 | 0 | 0 | 0 |
| Vox | 15 | 7 | 1 | 0 | 6 (+1 sin competencia) |

¹ `a_favor_cumple`, `a_favor_avanza` o `en_contra_contradice`. ² `en_contra_cumple`,
`en_contra_avanza` o `a_favor_contradice`. El detalle por promesa, con cita literal, página y
votaciones, está en `resultados.json`.

## Método

1. **Páginas:** las categorías con tema vivienda de `../categorias/` más las páginas con al menos dos
   menciones a vivienda, alquiler, desahucio, okupación o hipoteca.
2. **Promesas** (`promesas/`): extraídas con IA con las reglas de Escaño Abierto (compromiso de futuro,
   objeto identificable, comprobable). Cada cita se comprobó literal contra el texto del PDF.
3. **Votaciones** (`pool.json`): 100 votaciones del Pleno con tema vivienda o palabras de vivienda en
   el título. Para 25 iniciativas se descargó del BOCG el texto de lo que se votaba
   (`textos_operativos.json`: la parte dispositiva de mociones y PNL, el inicio de leyes y RDL), con
   los nombres de los grupos sustituidos por `[GRUPO]`.
4. **Candidatas:** BM25 sin IA, 12 votaciones por promesa (`scripts/candidatos.py`).
5. **Juicio a ciegas** (`juicios/`): IA sin saber el partido ni el voto. Relación: cumple, avanza,
   contradice, relacionada o no relacionada.
6. **Resultado** (`scripts/resultado.py`): regla fija de Escaño Abierto. Posición = mayoría (80 %) de
   los diputados elegidos en la candidatura, no del grupo actual.

## Límites conocidos

- Se usó el texto de la moción tal como se presentó. Si se votó con una enmienda transaccional, lo
  votado puede diferir.
- Sin texto en el BOCG: votaciones 93-11 a 93-16, 180-x, 151-2, 134-2, 70-x y el punto 1 de
  162/000167. Se juzgaron por el título y quedaron como mucho en «relacionada».
- Leyes y RDL: solo se leyó el inicio del texto, así que faltan relaciones con su articulado.
- Juicios discutibles a revisar a mano:
  - 197-2 (reforma de la Ley 12/2023) marcada «contradice» frente a promesas de derogarla (PP-03,
    VOX-14, UPN-02).
  - VOX-03: una devolución del IBI juzgada equivalente a una exención.
  - ERC-04 frente a 99-1.
- Muchas coincidencias se apoyan en mociones y PNL, que no obligan al Gobierno.
- «Sin votación relacionada» no es incumplimiento: muchas promesas no llegaron a votarse en el Pleno.
