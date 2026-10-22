# Posiciones de los programas frente a votos (PP, PSOE, Sumar, Vox)

Análisis interno del 22/10/2026 con los programas del 23J de PP, PSOE, Sumar y Vox en los 21 temas
de Escaño Abierto. Las normas prohíben mostrar resúmenes de programas en la herramienta.

## Qué hay

| Fichero | Contenido |
| --- | --- |
| `posiciones/` | Por partido y tema: `posicion_general` (2-3 frases escritas con IA) y `posicionamientos` (frases literales del programa, con página, subtema, postura y palabras clave). PSOE y Sumar van en dos mitades (`_A`, `_B`). |
| `posiciones_generales.json` | Tabla partido × tema con la posición general y el recuento de resultados. |
| `posicionamientos.json` | Las 803 frases en una lista. |
| `juicios/` | Juicio a ciegas de cada par frase-votación. `keys_NN.map` traduce la clave opaca al id de la frase. |
| `resultados.json` | Por frase: resultado y votaciones que la cumplen, avanzan o contradicen, con el voto del partido. |
| `scripts/` | Descarga del BOCG, candidatas, cruce final, comprobación de citas y las instrucciones dadas a los agentes. |

## Resultado

| Partido | Frases | Votó a favor de lo que defiende | Votó en contra | Abstención o dividido | Sin votación relacionada |
| --- | --- | --- | --- | --- | --- |
| PP | 192 | 55 | 6 | 3 | 128 |
| PSOE | 207 | 30 | 24 | 9 | 144 |
| Sumar | 205 | 51 | 5 | 2 | 147 |
| Vox | 199 | 55 | 1 | 2 | 141 |

Tras las correcciones de abajo. La versión anterior daba PP 59/5/14/114, PSOE 35/33/11/128,
Sumar 58/10/2/135 y Vox 74/1/2/122.

## Correcciones tras la revisión

- **Mociones y PNL votadas enteras.** Si una moción o PNL con dos o más puntos se votó de una sola
  vez, el voto no se puede atribuir a uno de sus puntos: su relación baja a «relacionada» y deja
  de decidir el resultado (172 relaciones; p. ej. 88-66, 93-10, 118-7, 60-7, 58-9, 183-10, 154-3).
  `puntos_enteras.json` lista esas votaciones y `corregidos.json` las relaciones cambiadas.
- **154-3 (retirar el proyecto de LECrim) frente a «aprobar una nueva LECrim» del PP:** pasa a
  «relacionada»; retirar el proyecto del Gobierno no se opone a aprobar otra ley.
- **200-2 (PNL de un solo punto: «aprobar de forma inmediata el Proyecto de Ley de Familias»):** no
  se corrige. El juicio es correcto y la abstención de PSOE y Sumar es el dato.

## Método

1. Cada programa se leyó tema a tema (categorías de `../categorias/` y búsqueda en el resto). Las
   803 citas se comprobaron literales contra la página de su propio programa.
2. Se descargó del BOCG el texto de las 458 iniciativas que hay detrás de las 1.690 votaciones con
   tema (447 con texto), sin los nombres de los grupos. De mociones y PNL se tomó la parte
   dispositiva; de leyes y RDL, el inicio.
3. Candidatas: BM25 sin IA, 8 votaciones del mismo tema por frase (6.231 pares).
4. Juicio a ciegas con IA, en 10 lotes por tema, sin partido ni voto.
5. Cruce con regla fija (de `escano/promesas.py`): la votación de más peso que cumple o contradice
   decide. La posición es la de los diputados elegidos en la candidatura, con un umbral del 80 %.

## Límites

- Hay votaciones cuyo texto del BOCG no coincide con su título (p. ej. 164-19, 164-23, 34-1, las
  enmiendas 169-x). El expediente de los datos o el primer enlace del BOCG no era el de lo votado,
  y se juzgaron por el título.
- Se usa el texto presentado; si se votó con una enmienda transaccional, lo votado puede diferir.
  Las votaciones de enmiendas y de enmiendas del Senado no tienen el texto de la enmienda.
- De leyes y RDL solo se leyó el inicio, así que faltan relaciones con su articulado.
- Muchas coincidencias son mociones y PNL, que no obligan, y a menudo mezclan peticiones con
  críticas al Gobierno. Un partido del Gobierno puede votar en contra de una moción que pide algo
  de su programa. Esto pesa en el recuento del PSOE.
- «Sin votación relacionada» no es incumplimiento.
- La posición general y la asignación de temas están hechas con IA; los juicios dudosos que cada
  lote señaló están en los informes de la sesión y conviene revisarlos a mano.
