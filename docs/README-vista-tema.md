# Vista por tema

La pieza central de la web: una persona elige un tema (p. ej. Vivienda) y ve cómo votó cada grupo
en el Pleno del Congreso durante la XV legislatura, con cada voto enlazado a su fuente oficial en
congreso.es. No resume posiciones ni compara partidos: muestra los votos y deja que cada cual saque
sus conclusiones.

Este README es el resumen para el equipo. El detalle (tipos, reglas, textos exactos) está en la
especificación: [2026-10-22-1921-spec-vista-tema.md](2026-10-22-1921-spec-vista-tema.md). Si algo
no cuadra, mandan [COMPETITION.md](COMPETITION.md), [AGENTS.md](../AGENTS.md) y
[DESIGN.md](../DESIGN.md), en ese orden.

## Qué ve quien la usa

- **`/tema/`**: una tarjeta por cada uno de los 18 temas, con «N iniciativas · M votaciones».
- **`/tema/[slug]/`**: título, una línea con el recuento y las fechas, la leyenda de votos y tres
  vistas sobre los mismos datos:

| Vista | Qué responde | Cómo |
| --- | --- | --- |
| **Matriz** | ¿Qué votó cada grupo en cada iniciativa? | Tabla iniciativa × grupo. Cada fila se despliega con el texto oficial, cada votación y los motivos de cada grupo. |
| **Ficha de grupo** | ¿Cómo votó un grupo en este tema? | Recuentos por tipo de iniciativa y por quién la propuso. Cada cifra filtra la matriz. |
| **Tiras** | ¿Cómo se repartieron sus votos en el tiempo? | Un renglón por grupo, una marca por votación. Clic abre la iniciativa en la matriz. |

Al final de la página: fuentes (Escaño Abierto, congreso.es) y la nota de que los temas se asignan
por palabras clave y los motivos son resúmenes generados por IA.

Referencia visual con datos reales de Vivienda:
<https://claude.ai/code/artifact/7653c333-0312-4b41-abce-5eaf498c381c> (privada: pedid a Dani que
la comparta). Sirve para el comportamiento y la estructura; el estilo es el de `DESIGN.md`.

## Cómo está hecha

```text
src/lib/datos.ts                 tema(slug), temas() — se calculan en build, sin datos nuevos
src/lib/datos.test.ts            tests de agrupación y recuentos
src/app/tema/page.tsx            índice
src/app/tema/[slug]/page.tsx     Server Component, generateStaticParams sobre TEMAS
src/components/tema/
  VistaTema                      cliente: guarda «filtro» y «fila abierta»
    MatrizTema
    FichaGrupo
    TirasTema
src/components/vote-mark.tsx     marca + etiqueta de voto (nuevo)
src/components/scroll-table.tsx  tabla con scroll horizontal propio (nuevo)
src/lib/titles.ts                regla de títulos completos (nuevo)
```

Sin librerías nuevas, ni de gráficos ni de estado. Las tiras son SVG a mano.

Los datos se limpian así (detalle en §3 de la spec):

- Las votaciones se agrupan en **iniciativas** por expediente; sin expediente, por fecha + texto.
- Las votaciones de **enmiendas** se separan: solo se cuentan y se enlazan.
- Una iniciativa entra en un tema si **alguna** de sus votaciones lo tiene.
- De las sesiones solo se usan campos oficiales (`id`, `fecha`, `organo`, `ds`).
- Los títulos nunca se recortan.

## Reglas que no se negocian

- Grupos siempre en orden alfabético; iniciativas por fecha. Nada se ordena por una cifra.
- Mismo componente, tamaño y texto para todos los grupos, también cuando faltan datos.
- Abstención es abstención; «No vota» nunca cuenta como voto en contra.
- Sin etiqueta resumen de posición, sin porcentajes, sin comparar grupos entre sí.
- Todo motivo lleva «Resumen generado por IA» y enlaza su Diario de Sesiones.
- Cada votación enlaza a congreso.es en un clic como máximo.
- El Grupo Mixto no es un partido: aparece como proponente, no como columna.
- Sin colores de partido: las marcas de voto se distinguen por forma y texto, nunca solo por color.

## Reparto

Tres piezas en paralelo, una vez fijados los tipos `Tema` e `Iniciativa` (§3 de la spec):

1. **Datos**: `tema()`, `temas()` y sus tests.
2. **Matriz y página**: `/tema/`, `/tema/[slug]/`, `VoteMark`, `ScrollTable`, títulos.
3. **Ficha y tiras**: con datos de ejemplo hasta que la pieza 1 esté lista.

Cada pieza en su rama desde `dev` (`<nombre>/<tarea>`), como dice [AGENTS.md](../AGENTS.md).

## Cuándo está terminada

- `bun run lint`, `bun run typecheck`, `bun run test` y `bun run build` pasan, y
  `/tema/vivienda/` existe en el build estático.
- `tema("vivienda")` da 29 iniciativas y 86 votaciones principales.
- A 360 px la página no hace scroll lateral; matriz y tiras se desplazan dentro de su caja;
  controles de 44 px.
- Todo se puede usar con teclado y el foco va al destino tras cada acción.
- Sin JavaScript, la matriz se ve entera y los enlaces oficiales funcionan.
- Se cumple la lista de neutralidad (§9 de la spec).

## Pendiente de decidir

- Votaciones sin tema (495): propuesta, fuera de las vistas y su recuento en `/metodo/`.
- Temas con muchas iniciativas (Impuestos, 95): propuesta, no paginar; las filas plegadas bastan.
