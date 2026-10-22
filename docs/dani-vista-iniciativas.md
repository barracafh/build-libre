# Vista por tema

La pieza central de la web: una persona elige un tema (p. ej. Vivienda) y ve cómo votó cada grupo
en el Pleno del Congreso durante la XV legislatura, con cada voto enlazado a su fuente oficial en
congreso.es. No resume posiciones ni compara partidos: muestra los votos y deja que cada cual saque
sus conclusiones.

Si algo de aquí choca con otra regla, mandan, en este orden, [AGENTS.md](../AGENTS.md),
[COMPETITION.md](COMPETITION.md) y [DESIGN.md](../DESIGN.md).

Es también el ejemplo de cómo se integra una vista en la estructura común: ver «Frontend
structure» en [AGENTS.md](../AGENTS.md).

## 1. Alcance

Dentro:

- Página índice `/tema/` con los 18 temas de `TEMAS` (`src/lib/datos.ts`).
- Página `/tema/[slug]/` con tres vistas: **matriz**, **ficha de grupo** y **tiras**.
- `datosTemas()` en `src/lib/datos.ts`, que agrupa las votaciones y se guarda en `data/temas.json`
  (`node scripts/temas.ts`), y `temas()`, que las páginas usan para leer ese fichero.
- Colores de partido para identificar a cada grupo, nunca el voto (`DESIGN.md` → «Party colours»).

Fuera (no hacer en esta tarea):

- Votaciones de enmiendas en la matriz, la ficha o las tiras: solo se enlazan en la fila desplegada.
- Intervenciones y resúmenes de sesión (texto de IA más allá de los motivos por grupo).
- Comparar partidos entre sí, porcentajes de coincidencia, rankings, búsqueda libre.

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

## 3. Datos: `data/temas.json`

Solo servidor. `datosTemas()` agrupa todas las votaciones y `scripts/temas.ts` lo escribe en
`data/temas.json` (también lo lanza `bun run data:fetch`). Las páginas leen ese fichero con
`temas()` en el build, sin volver a agrupar. Tipos completos en `src/lib/datos.ts`:

```ts
export type Iniciativa = {
  clave: string;               // exp, o id de la primera votación si no hay exp
  tipo: string;                // campo oficial `tipo` de la primera votación principal
  titulo: string;              // sin el sufijo «(punto N)»; ver §3.2
  texto: string;               // texto oficial
  proponente: string | null;   // código de grupo, "GOB", "MIXTO" o null
  fecha: string;               // fecha de la última votación (YYYY-MM-DD)
  temas: string[];             // unión de los temas de sus votaciones
  votaciones: Votacion[];      // principales, de la más antigua a la más reciente
  enmiendas: Pick<Votacion, "id" | "fecha" | "titulo" | "fuente">[];
  sesiones: { id: string; fecha: string; organo: string; diario: string | null }[];
};

export type Tema = {
  slug: string;
  nombre: string;
  recuento: { iniciativas: number; votaciones: number; enmiendas: number };
  iniciativas: string[];       // claves, de la más reciente a la más antigua
};

export type DatosTemas = {
  instantanea: { commit: string; fecha: string };
  partidos: Partido[];
  temas: Tema[];                           // en el orden de TEMAS
  iniciativas: Record<string, Iniciativa>; // por clave
  sinTema: { iniciativas: number; votaciones: number };
};

export function datosTemas(): DatosTemas;  // calcula; lo usa scripts/temas.ts
export const temas = (): DatosTemas;       // lee data/temas.json; lo usan las páginas
```

### 3.1 Reglas de limpieza

1. **Agrupar en iniciativas** por `exp`. Si la votación no tiene `exp`, agrupar por `fecha` +
   `texto` oficial (así los puntos de una misma moción, p. ej. `132-16…19`, son una iniciativa).
2. **Separar enmiendas**: una votación es de enmienda si su título cumple
   `/\((resto de (las )?|votación en bloque de las )?enmienda/i` (`esEnmienda`). El resto son votaciones principales y se muestran todas
   (toma en consideración, puntos, Senado, conjunto). No elegir una «votación principal».
3. **Temas por iniciativa**: la iniciativa entra en un tema si alguna de sus votaciones lo tiene
   (unión). Una iniciativa con solo enmiendas en el tema también entra.
4. **Sesiones**: de `data/sesiones/*.json`, las que tengan la votación en `puntos[].votos`. Solo
   campos oficiales (`id`, `fecha`, `organo`, `ds`); nunca `titular`, `resumen` ni `momentos`.
5. **Motivos**: ya vienen en `Votacion.motivos`; no copiarlos a la iniciativa.
6. **Orden**: iniciativas por fecha descendente; grupos siempre alfabéticos (`partidos()`). Nunca
   ordenar por un resultado.

### 3.2 Títulos

Nunca recortar títulos (`DESIGN.md` → «Typography»). Si el título de origen lleva «…», se muestra
el primer párrafo de `texto` más la nota de la votación, p. ej. «(punto 2)» (`tituloCompleto` en
`src/components/tema/comun.ts`). En la iniciativa se quita el sufijo «(punto N)»; en cada votación
se mantiene, porque distingue los puntos. En las listas, el título se corta a 3 líneas solo en
pantalla (`line-clamp-3`).

### 3.3 Tests (`src/lib/datos.test.ts`)

- Movilidad Sostenible (`121/000009`) suma sus 141 votaciones entre principales y enmiendas, y
  ninguna enmienda queda entre las principales.
- `132-16`, `132-17`, `132-18` y `132-19` están en la misma iniciativa.
- Vivienda tiene 29 iniciativas, 86 votaciones principales y 0 de enmiendas.
- Cada votación con tema aparece una sola vez en cada uno de sus temas, y las que no tienen tema
  se cuentan en `sinTema`.
- `data/temas.json` es igual a `datosTemas()`: si cambian los datos o las reglas, regenerarlo con
  `node scripts/temas.ts`.

## 4. Páginas

`generateStaticParams` sobre `TEMAS` (`dynamicParams = false`). La página es un Server Component
que llama a `temas()` y pasa a los componentes cliente solo las iniciativas del tema y los
partidos. El aviso «Herramienta experimental. No es un servicio oficial.» y `<BotonAviso />` los
pone el shell (`src/app/layout.tsx`); cada página añade su `<Fuentes />`.

### 4.1 `/tema/`

Rejilla de `card-link` (1/2/3 columnas según `DESIGN.md`), una por tema en el orden de `TEMAS`:
nombre y «N iniciativas · M votaciones». Nada más.

### 4.2 `/tema/[slug]/`, de arriba abajo

1. `h1` con el nombre del tema y una línea: «N iniciativas y M votaciones, del <fecha> al <fecha>.»,
   más «Las K votaciones de enmiendas se enlazan en el detalle.» solo si K > 0.
2. Leyenda de marcas de voto (una sola vez en la página).
3. **Matriz** (§5).
4. **Ficha de grupo** (§6).
5. **Tiras** (§7).
6. Fuentes: Escaño Abierto (CC BY 4.0) con commit e instantánea (`instantanea()`), congreso.es, y
   la nota: «Los temas se asignan por palabras clave, sin IA. Los motivos de cada grupo son
   resúmenes generados por un modelo de lenguaje a partir del Diario de Sesiones.»

## 5. Matriz: iniciativa × grupo

Tabla dentro de `ScrollTable` (scroll horizontal propio; la página nunca hace scroll lateral).

- **Columnas**: iniciativa · un grupo por columna en orden alfabético, con su color y el nombre
  corto (sin «Grupo »).
- **Fila**: título (botón que despliega, con `aria-expanded`); debajo, en pequeño: fecha · `tipo` ·
  «propone <grupo>» · «N votaciones» si hay más de una. El enlace oficial está en la fila
  desplegada.
- **Celda**:
  - una votación: marca + etiqueta («Sí», «No», «Abstención», «Dividido», «No vota», «Sin datos»);
  - varias votaciones con el mismo voto: marca + etiqueta + «en las N»;
  - varias con votos distintos: una marca pequeña por punto, en orden, y debajo el recuento
    «5 sí · 4 no». Nunca reducirlo a un solo voto;
  - tooltip nativo (`title`) con cada votación: título, voto y recuento de diputados
    («118 sí, 1 no vota»). El mismo detalle está, como texto, en la fila desplegada.
- **Fila desplegada** (debajo, a todo el ancho):
  - texto oficial; tipo, proponente, expediente; enlaces a cada Diario de Sesiones;
  - tabla votaciones × grupos: título de la votación, totales Sí/No/Abst., «Votación oficial ↗»,
    y por grupo marca + etiqueta + recuento de diputados;
  - «Votaciones de enmiendas (K)», plegado (`<details>`): fecha, título y «Votación oficial ↗» de
    cada una;
  - «Motivos de cada grupo»: una tarjeta por grupo, en orden alfabético, con un motivo por cada
    votación que lo tenga: enlace a esa votación oficial, la etiqueta «Resumen generado por IA»,
    texto, orador, fecha y «Diario de Sesiones ↗». Si no hay motivo: «Sin intervención registrada
    en los datos.», igual para todos los grupos.
- **Filtro** (lo activa la ficha, §6): banda encima de la tabla «N iniciativas donde <grupo> votó
  <voto> · <categoría>» con botón «Quitar filtro ×». El recuento va en `aria-live`.
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

- Tooltip nativo (`<title>`): grupo, voto, fecha, título de la votación, proponente.
- Clic: abre la iniciativa en la matriz y mueve el foco a su título. Solo ratón o toque: la
  alternativa por teclado es la matriz.
- Todo el SVG, etiquetas incluidas, se desplaza en horizontal dentro de su caja en móvil.
- `role="img"` con `aria-label`; la matriz es la alternativa en tabla.

## 8. Componentes y ficheros

```text
src/lib/datos.ts                     datosTemas(), temas(), esEnmienda()
src/lib/datos.test.ts                tests (§3.3)
scripts/temas.ts                     escribe data/temas.json
src/app/tema/page.tsx                índice
src/app/tema/[slug]/page.tsx         Server Component
src/components/tema/
  vista-tema.tsx    VistaTema        cliente: guarda «filtro», «filas abiertas» y grupo elegido
  matriz.tsx        Matriz           §5
  ficha-grupo.tsx   FichaGrupo       §6
  tiras.tsx         Tiras            §7
  comun.ts                           tipos de iniciativa, títulos, fechas, filtro
```

Piezas compartidas que usa (en `src/components/`, para cualquier vista):

| Pieza | Fichero | Uso aquí |
| --- | --- | --- |
| `VoteMark`, `Voto`, `ETIQUETA` | `vote-mark.tsx` | Marca y etiqueta de voto en matriz, ficha y leyenda |
| Tokens `--vote-*` | `src/app/globals.css` | Apuntan a tokens de Sol; no crean colores |
| `ScrollTable` | `scroll-table.tsx` | Matriz y tabla de votaciones de la fila desplegada |
| `NombrePartido`, `Muestra` | `partido.tsx` | Nombre del grupo con su color y borde de 1 px |
| `CardLink` | `card-link.tsx` | Tarjetas del índice de temas |
| `Fuentes` | `fuentes.tsx` | Fuentes de cada página |

Marcas (`DESIGN.md` → «Vote tones and marks»): Sí círculo lleno, No cuadrado lleno, Abstención
anillo grueso, No vota anillo fino pequeño, Dividido medio círculo, Sin datos anillo discontinuo.
Siempre con su texto al lado; nunca solo color. Sin librerías nuevas, ni de gráficos ni de estado.

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

La lista general es «Definition of done for a view» en [AGENTS.md](../AGENTS.md). Para esta vista:

- `bun run typecheck`, `bun run test` y `bun run build` pasan, y `/tema/vivienda/` existe en el
  build estático.
- A 360 px: la página no hace scroll lateral; matriz y tiras se desplazan dentro de su caja;
  controles de 44 px.
- Teclado: se puede abrir cada fila, elegir grupo, usar cada cifra de la ficha y quitar el filtro;
  el foco es visible y va al destino tras cada acción.
- Sin JavaScript: la matriz se ve completa (sin desplegar) y los enlaces oficiales funcionan.
- Se cumple la lista de §9.

## 11. Pendiente de decidir

- Votaciones sin tema (495). Propuesta: fuera de las vistas, con su recuento en `/metodo/`.
- Temas con muchas iniciativas (Impuestos, 95): ¿paginar la matriz? Propuesta: no; bastan las
  filas plegadas.
