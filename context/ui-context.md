# Contexto de interfaz: Track libre

Este fichero define el lenguaje visual. El agente no toma decisiones visuales: lee este fichero y el spec de la unidad.

Base: Sol, el sistema visual de Reforma Digital, con el OK de su autor. Los tokens viven en `src/styles/tema.css` y **no se cambian**. No se añaden colores, fuentes, radios ni sombras. Si una unidad necesita algo que no está aquí, para y pregunta (ver `ai-workflow-rules.md`, sección 4).

Los valores hex de la tabla son equivalentes sRGB aproximados de los valores oklch del token. La fuente de verdad es `tema.css`.

## 1. Principios

1. Todo color, radio y sombra sale de un token. Ningún valor en bruto en componentes ni páginas.
2. Ninguna pantalla tiene modo oscuro. La base es blanca. No se añaden clases `.dark`.
3. Un voto, una posición o un estado nunca se indica solo con color: siempre icono y texto.
4. Una acción principal por pantalla: `Button variant="sunset"`. El resto usa `outline` o `secondary`.
5. Una tarjeta con el sol (`--brand-yellow`) por vista: la del dato que más importa.
6. El rojo de marca es un acento, no un color de texto largo ni de botón de texto.
7. Ningún color identifica a un partido. Los partidos se distinguen por su nombre, en orden alfabético.

## 2. Paleta

### 2.1 Tokens base (shadcn/ui)

| Token | Valor | Hex aprox. | Clase Tailwind | Uso |
|---|---|---|---|---|
| `--background` | `#ffffff` | #ffffff | `bg-background` | Fondo de página |
| `--foreground` | `oklch(0.145 0 0)` | #0a0a0a | `text-foreground` | Texto principal |
| `--card` | `#ffffff` | #ffffff | `bg-card` | Fondo de tarjeta |
| `--card-foreground` | `oklch(0.145 0 0)` | #0a0a0a | `text-card-foreground` | Texto en tarjeta |
| `--popover` | `#ffffff` | #ffffff | `bg-popover` | Superficies flotantes |
| `--popover-foreground` | `oklch(0.145 0 0)` | #0a0a0a | `text-popover-foreground` | Texto en superficie flotante |
| `--primary` | `oklch(0.205 0 0)` | #171717 | `bg-primary` | Fondo de `default` y `sunset` |
| `--primary-foreground` | `oklch(0.985 0 0)` | #fafafa | `text-primary-foreground` | Texto sobre `primary` |
| `--secondary` | `oklch(0.97 0 0)` | #f5f5f5 | `bg-secondary` | Fondo de `secondary` |
| `--secondary-foreground` | `oklch(0.205 0 0)` | #171717 | `text-secondary-foreground` | Texto sobre `secondary` |
| `--muted` | `oklch(0.97 0 0)` | #f5f5f5 | `bg-muted` | Bloques de apoyo, aviso superior, pie de tarjeta |
| `--muted-foreground` | `oklch(0.556 0 0)` | #737373 | `text-muted-foreground` | Texto de apoyo (ver 4.2: no sobre `muted`) |
| `--accent` | `oklch(0.97 0 0)` | #f5f5f5 | `bg-accent` | Hover de elementos de menú |
| `--accent-foreground` | `oklch(0.205 0 0)` | #171717 | `text-accent-foreground` | Texto sobre `accent` |
| `--destructive` | `oklch(0.577 0.245 27.325)` | #e7000b | `text-destructive` | Error de validación |
| `--border` | `oklch(0.922 0 0)` | #e5e5e5 | `border-border` | Bordes |
| `--input` | `oklch(0.922 0 0)` | #e5e5e5 | `border-input` | Borde de campos |
| `--ring` | `oklch(0.708 0 0)` | #a3a3a3 | `ring-ring` | Anillo de foco (ver 4.3) |

### 2.2 Tokens de Sol

| Token | Valor | Hex | Clase o uso | Uso permitido |
|---|---|---|---|---|
| `--brand` | `#df1717` | #df1717 | `bg-brand`, `text-brand` | Icono de la app, números de paso, acento |
| `--brand-dark` | `#a50e0e` | #a50e0e | `var(--brand-dark)` | Sin uso previsto en esta herramienta |
| `--brand-orange` | `#ff7a1a` | #ff7a1a | Solo dentro de `--brand-gradient`, `--brand-sun` | Sin uso directo |
| `--brand-yellow` | `#ffbe0b` | #ffbe0b | `bg-brand-yellow`, `::selection` | Tarjeta con el sol (una por vista) |
| `--text-secondary` | `#4d4d4d` | #4d4d4d | `text-(--text-secondary)` | Texto secundario, etiquetas, URLs |
| `--warning` | `#fff3d1` | #fff3d1 | `bg-(--warning)` | Estado «dividido» |
| `--warning-foreground` | `#6b4a00` | #6b4a00 | `text-(--warning-foreground)` | Texto sobre `--warning` |
| `--disabled` | `#e4e4e4` | #e4e4e4 | `bg-(--disabled)` | Fondo de elemento sin datos |
| `--disabled-foreground` | `#767676` | #767676 | Solo para elementos desactivados, no para texto informativo (ver 4.2) | — |

### 2.3 Gradientes y sombras (solo los de Sol)

| Token | Uso permitido | Uso prohibido |
|---|---|---|
| `--brand-gradient` | Hero, si la unidad lo pide | Fondos de tarjeta de datos |
| `--brand-sun` | Hover de `Button variant="sunset"` (ya incluido) | Cualquier otro uso |
| `--shadow-soft` | Superficies flotantes | Tarjetas de contenido |
| `--shadow-overlay` | Diálogos y menús | Tarjetas de contenido |

No se escriben gradientes nuevos con colores en bruto. Los dos gradientes que trae la plantilla en `src/app/page.tsx` (la tarjeta «Plazo» y el pie) usan hex directos. Se sustituyen o se quitan al construir la herramienta (ver sección 9).

### 2.4 Colores de voto y estado (solo tokens existentes)

| Estado | Icono (lucide-react) | Texto (exacto) | Fondo | Texto e icono |
|---|---|---|---|---|
| A favor | `CircleCheck` | A favor | `bg-card` | `text-foreground` |
| En contra | `CircleX` | En contra | `bg-card` | `text-foreground` |
| Abstención | `CircleMinus` | Abstención | `bg-card` | `text-(--text-secondary)` |
| Dividido | `CircleDot` | Dividido (mayoritariamente a favor / en contra / abstención) | `bg-(--warning)` | `text-(--warning-foreground)` |
| Sin votación o no vota | `CircleDashed` | Sin votación | `bg-muted` | `text-(--text-secondary)` |
| Coincide (calculadora) | `CircleCheck` | Coincide | `bg-card` | `text-foreground` |
| No coincide (calculadora) | `CircleX` | No coincide | `bg-card` | `text-foreground` |
| Sin intervenciones | — | Sin intervenciones registradas | `bg-muted` | `text-(--text-secondary)` |
| Análisis automático | — | Análisis automático, no verificado | Badge `outline` | `text-foreground` |

Reglas de este bloque:
- Los votos no usan rojo ni verde. Un hue por voto daría una lectura de «bueno» o «malo» y destacaría a partidos.
- El rojo de marca no se usa para «en contra».
- Los nombres de icono se verifican contra `lucide-react` 1.59.0 antes de usarlos. Si uno no existe, se usa otro del mismo significado y se anota en `progress-tracker.md`.
- Los iconos de estado llevan `aria-hidden="true"`: el texto ya lo dice.

## 3. Tipografía

| Rol | Fuente | Token | Tamaño | Peso | Interlineado | Tracking |
|---|---|---|---|---|---|---|
| Texto de cuerpo | Geist | `font-sans` (`--font-geist`) | 16 px (`text-base`) | 400 | 1.55 (`leading-[1.55]`) | normal |
| Lead de página | Geist | `font-sans` | 18 px (`text-lg`) | 400 | 1.55 | normal |
| H1 | Georgia | `font-heading` | `clamp(36px,4.5vw,60px)` | 400 | 1.1 | -0.02em |
| H2 | Georgia | `font-heading` | `clamp(30px,5vw,44px)` | 400 | 1.08 | -0.03em |
| H3 | Geist | `font-sans` | 16–18 px | 500 | 1.35 | normal |
| Etiqueta (eyebrow) | Geist Mono | `font-mono` | 12 px (`text-xs`) | 400 | — | 0.06em, mayúsculas |
| Dato, URL, cifra corta | Geist Mono | `font-mono` | 14 px (`text-sm`) | 400 | — | normal |
| Número de paso | Geist | `font-sans` | 22–26 px | 300 (`font-light`) | 1.1 | normal, `tabular-nums` |
| Botón | Geist | `font-sans` | 14 px (`text-sm`) | 500 | — | normal |

Reglas:
1. La serif (Georgia) solo en H1 y H2. Nada más.
2. Ningún texto de lectura por debajo de 16 px. `text-sm` (14 px) solo para metadatos. `text-xs` (12 px) solo para etiquetas y `Badge`.
3. La fuente `FFF Tool Serif Text` no se sirve: se ve Georgia. No se añade ninguna fuente.
4. `text-wrap: balance` en títulos y `text-wrap: pretty` en párrafos ya están en la base. No se repiten.

## 4. Contraste, foco y estados

### 4.1 Contrastes de referencia (WCAG AA: 4.5:1 para texto normal, 3:1 para texto grande y componentes)

| Combinación | Ratio aprox. | Estado |
|---|---|---|
| `#0a0a0a` sobre `#ffffff` | 19:1 | Cumple |
| `#4d4d4d` sobre `#ffffff` | 8.5:1 | Cumple |
| `#4d4d4d` sobre `#f5f5f5` | 7.8:1 | Cumple |
| `#737373` sobre `#ffffff` | 4.7:1 | Cumple |
| `#737373` sobre `#f5f5f5` | 4.4:1 | **No cumple** para texto normal |
| `#df1717` sobre `#ffffff` | 4.9:1 | Cumple (texto normal) |
| `#6b4a00` sobre `#fff3d1` | ≈ 7:1 | Cumple |
| `#767676` sobre `#e4e4e4` | 3.6:1 | **No cumple** para texto |
| `#ffffff` sobre `#ffbe0b` | 1.7:1 | **No cumple**: sobre amarillo, texto oscuro |
| `#0a0a0a` sobre `#ffbe0b` | 12:1 | Cumple |

### 4.2 Reglas de texto

1. El texto de apoyo sobre fondo blanco usa `text-muted-foreground` o `text-(--text-secondary)`.
2. Sobre `bg-muted` o `bg-secondary`, el texto de apoyo usa `text-(--text-secondary)`, nunca `text-muted-foreground`.
3. Sobre `--brand-yellow` el texto es `text-foreground`. Nunca blanco.
4. `--disabled-foreground` no se usa para texto que informa. Solo para controles desactivados.

### 4.3 Foco

1. Los componentes de `src/components/ui/` ya traen `focus-visible:ring-3 focus-visible:ring-ring/50`. Se conservan tal cual.
2. **Riesgo:** `--ring` (#a3a3a3 al 50 %) tiene poco contraste sobre blanco para el criterio de componentes de WCAG 2.2 (3:1). Antes de publicar, la unidad de interfaz base comprueba el foco visible en cada control propio. Si no cumple, se decide con el usuario (ver sección 10).
3. Los enlaces de `Fuentes` usan `focus-visible:bg-muted` y `focus-visible:ring-inset`. No se quitan.
4. Todo control propio es un elemento nativo (`button`, `a`, `select`, `input`, `label`), salvo que el spec diga otra cosa.

### 4.4 Movimiento

1. La base ya desactiva transiciones con `prefers-reduced-motion`. No se añade ninguna animación que no esté en el spec.
2. Curva de movimiento de marca: `--ease-brand`.

## 5. Radios

Base: `--radius: 0.625rem` (10 px).

| Token | Tailwind | Valor calculado | Uso |
|---|---|---|---|
| `--radius-sm` | `rounded-sm` | 6 px | Elementos muy pequeños |
| `--radius-md` | `rounded-md` | 8 px | Controles compactos (`size xs`, `sm`) |
| `--radius-lg` | `rounded-lg` | 10 px | `Button` por defecto, iconos cuadrados de la cabecera |
| `--radius-xl` | `rounded-xl` | 14 px | `Card`, `Fuentes` |
| `--radius-2xl` | `rounded-2xl` | 18 px | Sin uso previsto |
| Píldora | `rounded-4xl` | Píldora | `Badge` |

No se usan radios arbitrarios. La plantilla usa `rounded-[28px]` en el pie: se sustituye por `rounded-2xl` o se quita (ver sección 9).

## 6. Espaciado, rejilla y medidas

| Medida | Valor | Uso |
|---|---|---|
| Margen lateral de página | `--page-gutter`: `clamp(20px, 3vw, 24px)` | Todo bloque de página (`px-(--page-gutter)`) |
| Ancho de lectura | 760 px (`max-w-[760px]`) | Columna principal de contenido |
| Ancho de contenedor | 1200 px (`--container-content`) | Cabecera y pie |
| Padding de tarjeta | 16 px (`--card-spacing`); 12 px en `size="sm"` | `Card` |
| Padding de tarjeta de contenido | 24 px (`px-6 py-6`) | Tarjetas de la plantilla |
| Separación de bloques | 32 px (`[&>*+*]:mt-8`) | Entre bloques de una respuesta |
| Separación de secciones | 64 px (`mt-16`) | Entre secciones de una página |
| Altura mínima de cabecera | 80 px (`min-h-20`) | Cabecera |
| Paddings verticales de página | 48 px móvil (`pt-12`), 80 px escritorio (`md:pt-20`) | `main` |
| Objetivo táctil mínimo | 44 px (`min-h-11`) | Enlaces y botones en lista |
| Breakpoint de escritorio | 768 px (`md`) | Único salto de diseño |
| Ancho mínimo soportado | 320 px, sin scroll horizontal | Toda pantalla |

## 7. Patrones de página

### 7.1 Esqueleto (ya en la plantilla)

1. Enlace «Saltar al contenido» (oculto hasta foco).
2. Aviso superior: `role="note"`, `bg-muted`, centrado, `text-sm`, texto «Herramienta experimental. No es un servicio oficial.». Obligatorio.
3. Cabecera: icono cuadrado (`bg-brand`, texto blanco, `font-mono`) + nombre de `ficha.json` + `Badge` con «Datos públicos» o «Datos simulados».
4. `main#contenido`: eyebrow (mono, mayúsculas), H1, lead, secciones.
5. Pie: bloque con fondo degradado de la plantilla (sustituir por tokens, ver sección 9) + `BotonAviso` («¿Algo está mal? Avísanos»). Obligatorio.

### 7.2 Composición de una respuesta o de una pantalla de datos

Orden fijo:
1. Pregunta o título de la pantalla como H1.
2. Respuesta directa en una o dos frases.
3. Bloque de detalle: pasos numerados, tarjetas o tabla.
4. «Dónde se hace» o equivalente (aquí: «Dónde se vota» con el enlace a congreso.es, con `buttonVariants({ variant: "sunset" })`).
5. `<Fuentes />`.
6. Fecha del volcado de datos (`text-sm`, `font-mono`).

### 7.3 Cuadrícula de posiciones (pieza central)

1. **Escritorio (≥ 768 px):** tabla. Filas = temas, columnas = partidos en orden alfabético. Cada celda muestra su estado con icono y texto (ver 2.4). Cabecera de columna con el nombre del partido en `text-sm`, `font-medium`.
2. **Móvil (< 768 px):** sin tabla. Un bloque por tema. Dentro, una lista de partidos en orden alfabético, cada uno con su estado. Así no hay scroll horizontal a 320 px.
3. Celda pulsable: elemento `button` con texto completo accesible (nombre del partido, tema y estado en el texto del botón, no solo en un icono).
4. Sin filtros en la cuadrícula. Sin color por partido.

### 7.4 Vista de cruce

1. Cabecera: partido y tema. H1.
2. Lista de votaciones: una `Card` por votación con fecha, título, órgano (Pleno o Comisión en `Badge outline`), estado del partido con icono y texto, porcentaje de mayoría y enlace a la ficha oficial.
3. Bloque de intervenciones debajo, con cita literal entre comillas, nombre del diputado, resumen y enlace a la sesión. Si no hay cita verificada, se muestra solo el resumen.
4. Si no hay intervenciones: «Sin intervenciones registradas».

### 7.5 Comparador y calculadora

1. Selección de partidos con `input` o `checkbox` nativos. Lista en orden alfabético.
2. Resultado por partido: número y porcentaje en `font-mono`, sin barra de ranking.
3. Coincidencias y discrepancias con icono y texto (ver 2.4).
4. El voto del usuario se marca con `button` de tres opciones (A favor, En contra, Abstención) y una opción «Sin marcar». Estado activo con `aria-pressed` y con texto, no solo con fondo.

## 8. Componentes existentes y su uso

| Componente | Archivo | Variantes permitidas | Tamaños | Uso en este proyecto |
|---|---|---|---|---|
| `Button` | `ui/button.tsx` | `sunset` (una por pantalla), `outline`, `secondary`, `ghost`, `link` | `default`, `sm`, `lg`, `icon` | Acciones. `destructive` no se usa: no hay acciones destructivas |
| `buttonVariants` | `ui/button.tsx` | Igual | Igual | Para enlaces con aspecto de botón (`<a>`), como «Abrir ficha oficial» |
| `Card` | `ui/card.tsx` | `size` `default` o `sm` | — | Votaciones, temas, bloques de respuesta. Usar `render={<section />}` cuando sea una sección |
| `Badge` | `ui/badge.tsx` | `outline` (principal), `secondary` | — | Órgano (Pleno/Comisión), tipo de datos, aviso de análisis automático |
| `Input`, `Textarea` | `ui/input.tsx`, `ui/textarea.tsx` | Según origen | — | Solo para la selección de partidos y de votaciones en la calculadora. Usar sus clases sin cambiarlas |
| `Fuentes` | `components/Fuentes.tsx` | — | — | Obligatorio en cada respuesta |
| `BotonAviso` | `components/BotonAviso.tsx` | — | — | Obligatorio en cada página |

Para añadir una pieza de shadcn/ui: `bunx shadcn@4.22.1 add <componente>`. Si el CLI pide sobrescribir, responder **no**.

## 9. Desviaciones de la plantilla a corregir

Estos puntos vienen de la plantilla o de `page.tsx`. Se corrigen en la unidad de interfaz base, salvo que el usuario decida conservarlos.

| # | Dónde | Problema | Corrección |
|---|---|---|---|
| 1 | `src/app/page.tsx`, tarjeta «Plazo» | Gradiente con hex directos | Usar `bg-brand-yellow` (sin gradiente), o `--brand-gradient` si el spec lo pide |
| 2 | `src/app/page.tsx`, pie | Gradiente con hex directos | Usar `--brand-gradient` o un token de Sol. Quitar hex |
| 3 | `src/app/page.tsx`, pie | `rounded-[28px]` fuera de escala | `rounded-2xl` |
| 4 | `src/app/page.tsx`, H2 | `font-sans` en H2; la regla dice serif en H1 y H2 | Quitar `font-sans` del H2 |
| 5 | `src/app/page.tsx`, texto | Texto blanco sobre `--brand-yellow` en la tarjeta «Plazo» (heredado del diseño) | Verificar contraste. Usar `text-foreground` |
| 6 | Sección 4.2 | `text-muted-foreground` sobre `bg-muted` no cumple AA | Usar `text-(--text-secondary)` |
| 7 | Sección 4.3 | Anillo de foco de baja luminancia | Decidir con el usuario (sección 10) |
| 8 | `src/app/page.tsx`, icono de `Fuentes` | Flecha `↗` en texto, no icono de la librería | Opcional: `ArrowUpRight` de lucide-react, `aria-hidden` |

## 10. Decisiones de interfaz que requieren al usuario

No se resuelven sin confirmación:

1. **Colores de partido.** `pre-development.md` dice que el color de partido solo sirve para identificar. Hoy no existen tokens de partido. Añadirlos incumple `AGENTS.md`. Propuesta: no usar color de partido. Los partidos se distinguen por nombre y orden alfabético.
2. **Sol en la vista de datos.** Qué dato lleva la única tarjeta con el sol por vista: propuesta, el resultado de la calculadora o la posición de la vista de cruce.
3. **Foco visible.** Si el anillo `ring-ring/50` cumple el criterio de WCAG para componentes. Si no, opciones con tokens existentes: `ring-foreground` o `outline` de 2 px en `--foreground`.
4. **Estado «alineamiento no definible»** (`pre-development.md`, calculadora). Su aspecto: propuesta, icono `CircleHelp` con texto y fondo `bg-muted`.
5. **Texto del sunset sobre sol.** `Button sunset` dibuja un sol amarillo en el hover. Hay que comprobar que el texto sigue legible en ese estado. Si no, el texto del botón pasa a `text-foreground` sobre el sol o se quita el sol en hover.

## 11. Copia y tono

1. Español de España, tuteo, frases cortas. El tono es de herramienta cívica: sin exclamaciones, sin superlativos, sin «tu partido».
2. Ningún texto de cara al ciudadano se inventa. Sale de un spec o de `project-overview.md`.
3. Cada cifra va con su fecha de volcado y su fuente.
4. Los textos de votos usan exactamente las etiquetas de la sección 2.4.
