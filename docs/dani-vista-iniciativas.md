# Vista por tema

La pieza central de la web: una persona elige un tema (p. ej. Vivienda) y ve cómo votó cada grupo
en el Pleno del Congreso durante la XV legislatura, con cada voto enlazado a su fuente oficial en
congreso.es. No resume posiciones ni compara partidos: muestra los votos y deja que cada cual saque
sus conclusiones.

Si algo de aquí choca con otra regla, mandan, en este orden, [COMPETITION.md](COMPETITION.md),
[AGENTS.md](../AGENTS.md) y [DESIGN.md](../DESIGN.md).

## 1. Alcance

Dentro:

- Página índice `/tema/` con los 18 temas de `TEMAS` (`src/lib/datos.ts`).
- Página `/tema/[slug]/` con tres vistas: **matriz**, **ficha de grupo** y **tiras**.
- Las funciones de datos `tema(slug)` y `temas()` en `src/lib/datos.ts`, con tests.

Fuera (no hacer en esta tarea):

- Votaciones de enmiendas en las vistas: solo su recuento y un enlace.
- Intervenciones y resúmenes de sesión (texto de IA más allá de los motivos por grupo).
- Comparar partidos entre sí, porcentajes de coincidencia, rankings, búsqueda libre.
- Colores de partido: no aprobados por la organización (`DESIGN.md` → «Party colours»).

Referencia visual con datos reales de Vivienda:
<https://claude.ai/code/artifact/7653c333-0312-4b41-abce-5eaf498c381c> (privada: pedid a Dani que
la comparta). Sirve para el comportamiento y la estructura; el estilo es el de `DESIGN.md` con los
componentes de Sol.

## 2. Qué ve quien la usa

| Vista | Qué responde | Cómo |
| --- | --- | --- |
| **Matriz** | ¿Qué votó cada grupo en cada iniciativa? | Tabla iniciativa × grupo. Cada fila se despliega con el texto oficial, cada votación y los motivos de cada grupo. |
| **Ficha de grupo** | ¿Cómo votó un grupo en este tema? | Recuentos por tipo de iniciativa y por quién la propuso. Cada cifra filtra la matriz. |
| **Tiras** | ¿Cómo se repartieron sus votos en el tiempo? | Un renglón por grupo, una marca por votación. Clic abre la iniciativa en la matriz. |

## 3. Datos: `tema(slug)`

Solo servidor, se calcula en build. Va en `src/lib/datos.ts`, sin ficheros de datos nuevos.

```ts
export type Iniciativa = {
  clave: string;               // exp, o id de la primera votación si no hay exp
  tipo: string;                // campo oficial `tipo` de la primera votación
  titulo: string;              // ver regla de títulos (§3.2)
  texto: string;               // texto oficial
  proponente: string | null;   // código de grupo, "GOB", "MIXTO" o null
  fecha: string;               // fecha de la última votación (YYYY-MM-DD)
  votaciones: Votacion[];      // principales, de la más antigua a la más reciente
  enmiendas: { total: number; ids: string[] };
  sesiones: { id: string; fecha: string; organo: string; diario: string | null }[];
};

export type Tema = {
  slug: string;
  nombre: string;
  recuento: { iniciativas: number; votaciones: number; enmiendas: number };
  iniciativas: Iniciativa[];   // de la más reciente a la más antigua
};

export const temas = (): Tema[] => …;               // en el orden de TEMAS
export const tema = (slug: string): Tema | undefined => …;
```

### 3.1 Reglas de limpieza

1. **Agrupar en iniciativas** por `exp`. Si la votación no tiene `exp`, agrupar por `fecha` +
   `texto` oficial (así los puntos de una misma moción, p. ej. `132-16…19`, son una iniciativa).
2. **Separar enmiendas**: una votación es de enmienda si su título cumple
   `/\((resto de (las )?)?enmienda/i`. El resto son votaciones principales y se muestran todas
   (toma en consideración, puntos, Senado, conjunto). No elegir una «votación principal».
3. **Temas por iniciativa**: la iniciativa entra en un tema si alguna de sus votaciones lo tiene
   (unión). Una iniciativa con solo enmiendas en el tema también entra.
4. **Sesiones**: de `data/sesiones/*.json`, las que tengan la votación en `puntos[].votos`. Solo
   campos oficiales (`id`, `fecha`, `organo`, `ds`); nunca `titular`, `resumen` ni `momentos`.
5. **Motivos**: ya vienen en `Votacion.motivos`; no copiarlos a la iniciativa.
6. **Orden**: iniciativas por fecha descendente; grupos siempre alfabéticos (`partidos()`). Nunca
   ordenar por un resultado.

### 3.2 Títulos

Nunca recortar títulos (`DESIGN.md` → «Typography»). Si el título de origen acaba en «…», usar el
primer párrafo de `texto`. En la iniciativa, quitar el sufijo «(punto N)»; en cada votación,
mantenerlo, porque distingue los puntos.

### 3.3 Tests (`src/lib/datos.test.ts`)

- Movilidad Sostenible (`121/000009`) es 1 iniciativa, con sus enmiendas fuera de `votaciones`.
- `132-16`, `132-17`, `132-18` y `132-19` están en la misma iniciativa.
- `tema("vivienda")` tiene 29 iniciativas y 86 votaciones principales (cifra de la referencia
  visual; si difiere, explicar por qué antes de cambiar el test).
- Ninguna iniciativa sin votaciones principales ni enmiendas; cada votación de un tema aparece en
  ese tema; las iniciativas están en orden de fecha descendente.

## 4. Páginas

`generateStaticParams` sobre `TEMAS`. La página es un Server Component que llama a `tema(slug)` y
pasa a los componentes cliente solo lo que necesitan. Toda página conserva el aviso «Herramienta
experimental. No es un servicio oficial.», `<BotonAviso />` y `<Fuentes />`.

### 4.1 `/tema/`

Rejilla de `card-link` (1/2/3 columnas según `DESIGN.md`), una por tema en el orden de `TEMAS`:
nombre y «N iniciativas · M votaciones». Nada más.

### 4.2 `/tema/[slug]/`, de arriba abajo

1. `h1` con el nombre del tema y una línea: «N iniciativas y M votaciones del Pleno, del <fecha> al
   <fecha>. Las votaciones de enmiendas no se muestran (K).»
2. Leyenda de marcas de voto (una sola vez en la página).
3. **Matriz** (§5).
4. **Ficha de grupo** (§6).
5. **Tiras** (§7).
6. Fuentes: Escaño Abierto (CC BY 4.0) con commit e instantánea (`instantanea()`), congreso.es, y
   la nota: «Los temas se asignan por palabras clave, sin IA. Los motivos de cada grupo son
   resúmenes generados por un modelo de lenguaje a partir del Diario de Sesiones.»

## 5. Matriz: iniciativa × grupo

Tabla dentro de `ScrollTable` (scroll horizontal propio; la página nunca hace scroll lateral).

- **Columnas**: fecha · iniciativa · un grupo por columna en orden alfabético, con el nombre corto
  (sin «Grupo »).
- **Fila**: fecha; título (enlace-botón que despliega, con `aria-expanded`); debajo, en pequeño:
  `tipo` · «propone <grupo>» · «N puntos» si hay más de uno · «oficial ↗» (la primera votación en
  congreso.es).
- **Celda**:
  - una votación: marca + etiqueta («Sí», «No», «Abstención», «Dividido», «No vota», «Sin datos»);
  - varias votaciones con el mismo voto: marca + etiqueta + «en los N puntos»;
  - varias con votos distintos: una marca pequeña por punto, en orden, y debajo el recuento
    «5 sí · 4 no». Nunca reducirlo a un solo voto;
  - tooltip (y texto accesible) con cada punto: título de la votación, voto y recuento de
    diputados («118 sí, 1 no vota»).
- **Fila desplegada** (debajo, a todo el ancho):
  - texto oficial; tipo, proponente, expediente; enlaces a cada Diario de Sesiones;
  - tabla votaciones × grupos: título de la votación, totales Sí/No/Abst., «Votación oficial ↗»,
    y por grupo marca + etiqueta + recuento de diputados;
  - «Motivos de cada grupo»: una tarjeta por grupo, en orden alfabético, con la etiqueta
    «Resumen generado por IA», texto, orador, fecha y «Diario de Sesiones ↗». Si no hay motivo:
    «Sin intervención registrada en los datos.», igual para todos los grupos.
- **Filtro** (lo activa la ficha, §6): banda encima de la tabla «Mostrando N iniciativas donde
  <grupo> votó <voto> · <categoría>» con botón «Quitar filtro ✕». El recuento va en `aria-live`.
- **Móvil (360 px)**: primera columna (iniciativa) fija a la izquierda, ~180 px; columnas de grupo
  de ~72 px; el resto se desplaza dentro de la tabla.

## 6. Ficha de grupo

- **Selector**: botones de grupo en orden alfabético (`aria-pressed`), 44 px de alto; por defecto
  el primero. Mismo componente y tamaño para todos.
- **Tarjeta «Por tipo de iniciativa»**: filas Leyes · Decretos ley del Gobierno · Mociones ·
  Proposiciones no de ley · Otras (solo las que tengan votaciones). Mapeo de `tipo`:
  - Leyes: «Proyecto de ley», «Toma en consideración», «Enmiendas del Senado», «Dictamen».
  - Decretos ley del Gobierno: «Convalidación RDL».
  - Mociones: «Moción». Proposiciones no de ley: «Proposición no de ley». Otras: el resto.
- **Tarjeta «Por quién la propuso»**: una fila por proponente, alfabético por nombre (Gobierno y
  Grupo Mixto por su nombre; «Sin proponente» al final). Incluye al propio grupo.
- **Columnas** de ambas tarjetas: Sí · No · Abst. · Div. · No vota, con su marca en la cabecera.
  Cada cifra mayor que 0 es un botón que filtra la matriz y lleva a ella; los ceros, en gris y sin
  acción.
- **Nota visible**: «Se cuentan votaciones, no iniciativas: una moción votada en 8 puntos suma 8.»
- **Tarjeta «Iniciativas que propuso en <tema>: N»**: lista con fecha y título; cada una abre su
  fila en la matriz. Debajo: «Tiene motivo registrado en X de N iniciativas.»
- **Prohibido aquí**: totales Sí/No del tema sin desglose, porcentajes, ordenar filas por cifras,
  comparar con otro grupo.

## 7. Tiras

SVG hecho a mano, un renglón por grupo (alfabético) y una marca por votación principal, en orden de
fecha (posición = orden, no escala de tiempo; los días con muchas votaciones ocupan más). Líneas y
etiquetas de año en el primer voto de cada año. Las marcas usan las mismas formas que el resto.

- Tooltip: grupo, voto, fecha, título de la votación, proponente.
- Clic o Enter: abre la iniciativa en la matriz y mueve el foco a su título.
- Etiquetas de grupo fijas a la izquierda; el resto se desplaza en horizontal en móvil.
- `role="img"` con `aria-label`; la matriz es la alternativa en tabla.

## 8. Componentes y ficheros

```text
src/lib/datos.ts                 tema(slug), temas()
src/lib/datos.test.ts            tests (§3.3)
src/app/tema/page.tsx            índice
src/app/tema/[slug]/page.tsx     Server Component
src/components/tema/
  VistaTema                      cliente: guarda «filtro» y «fila abierta»
    MatrizTema
    FichaGrupo
    TirasTema
```

Ya existen `src/components/Fuentes.tsx`, `src/components/BotonAviso.tsx` y `src/components/ui/*`.
`DESIGN.md` describe piezas que **aún no están en el repo**; hay que crearlas siguiendo esa
descripción:

| Pieza | Fichero | Uso aquí |
| --- | --- | --- |
| `VoteMark` | `src/components/vote-mark.tsx` | Marca + etiqueta de voto en matriz, ficha, leyenda |
| Tokens `--vote-*` | `src/app/globals.css` | Apuntan a tokens de Sol existentes; no crear colores |
| `ScrollTable` | `src/components/scroll-table.tsx` | Matriz y tablas de la ficha |
| `fullTitle` | `src/lib/titles.ts` | Regla de títulos (§3.2) |
| `formatTableNumber`, fechas | `src/lib/i18n.ts` | Cifras y fechas `es-ES` |

Marcas (`DESIGN.md` → «Vote tones and marks»): Sí círculo lleno, No cuadrado lleno, Abstención
anillo grueso, No vota anillo fino pequeño, Dividido medio círculo, Sin datos anillo discontinuo.
Siempre con su texto al lado; nunca solo color.

`MatrizTema`, `FichaGrupo` y `TirasTema` comparten el estado «filtro» y «fila abierta», que vive en
un único componente cliente `VistaTema` que los contiene. Sin librerías nuevas, ni de gráficos ni de
estado.

## 9. Neutralidad: lista de comprobación

- [ ] Grupos siempre en orden alfabético; iniciativas por fecha. Nada ordenado por cifras.
- [ ] Mismo componente, tamaño y textos para todos los grupos, también cuando faltan datos.
- [ ] Abstención se muestra como abstención; «No vota» nunca cuenta como voto.
- [ ] Ninguna etiqueta resumen de posición, ni suma de Sí/No entre iniciativas sin desglose.
- [ ] Ningún porcentaje de coincidencia entre grupos.
- [ ] Todo motivo lleva «Resumen generado por IA» y enlaza su Diario; nunca se filtra por motivo.
- [ ] Cada votación enlaza a congreso.es a un clic como máximo.
- [ ] El Grupo Mixto no aparece como partido (sí como proponente, por su nombre).

## 10. Cuándo está terminada

- `bun run lint`, `bun run typecheck`, `bun run test` y `bun run build` pasan, y
  `/tema/vivienda/` existe en el build estático.
- A 360 px: la página no hace scroll lateral; matriz y tiras se desplazan dentro de su caja;
  controles de 44 px.
- Teclado: se puede abrir cada fila, elegir grupo, usar cada cifra de la ficha y quitar el filtro;
  el foco es visible y va al destino tras cada acción.
- Sin JavaScript: la matriz se ve completa (sin desplegar) y los enlaces oficiales funcionan.
- Se cumple la lista de §9.

## 11. Reparto

Tres piezas en paralelo, una vez fijados los tipos de §3:

1. **Datos**: `tema()`, `temas()` y tests (§3).
2. **Matriz y página**: `/tema/`, `/tema/[slug]/`, `VoteMark`, `ScrollTable`, títulos (§4, §5, §8).
3. **Ficha y tiras** (§6, §7): con datos de ejemplo hasta que la pieza 1 esté lista.

Cada pieza en su rama desde `dev` (`<nombre>/<tarea>`), como dice [AGENTS.md](../AGENTS.md).

## 12. Pendiente de decidir

- Votaciones sin tema (495). Propuesta: fuera de las vistas, con su recuento en `/metodo/`.
- Temas con muchas iniciativas (Impuestos, 95): ¿paginar la matriz? Propuesta: no; bastan las
  filas plegadas.
