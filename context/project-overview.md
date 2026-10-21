# Project overview: Track libre (cómo votó cada partido)

## Qué hace la aplicación

Herramienta web pública, experimental y no oficial que muestra cómo votó cada grupo parlamentario del Congreso de los Diputados en la legislatura XV, organizado por temas de interés del votante (vivienda, sanidad, pensiones, inmigración…). Su vista principal es una cuadrícula de temas por partidos; cada celda abre las votaciones del tema con la posición del partido, junto a intervenciones literales de sus diputados. Incluye un comparador de 2 o más partidos y una calculadora que compara el voto del usuario con el de cada partido en un conjunto de votaciones elegido. Usa un volcado de datos públicos de Reforma Digital (API pública, CC BY 4.0 / MIT) guardado en el repositorio: no llama a la API en vivo, no tiene base de datos, cuentas ni analítica. Solo informa: nunca indica a quién votar ni ordena partidos por resultado.

## Objetivos

1. Responder a la pregunta "¿qué ha hecho cada partido sobre lo que me importa?" con una cuadrícula partido × tema.
2. Mostrar cada posición con su fuente: enlace a la votación oficial y a la intervención literal del diputado.
3. Permitir comparar 2 o 3 partidos tema a tema, indicando en qué votación difieren.
4. Permitir al usuario contrastar su propio voto con la posición de cada partido, sin guardar sus respuestas.
5. Mantener un enfoque consultivo: sin ganador, sin ranking, sin "tu partido es…", sin porcentaje de afinidad general.
6. Ser legible en móvil a 320 px y cumplir WCAG AA.
7. Estar lista para la demo del jueves 22 de octubre de 2026 con `bun run build` en verde.

## Flujo de usuario principal

1. El usuario abre `https://build.barraca.house/libre`.
2. Ve el aviso «Herramienta experimental. No es un servicio oficial.» y la fecha del volcado de datos.
3. Ve la cuadrícula completa: filas = los temas (campo `tm`), columnas = partidos en orden alfabético. No hay filtros previos.
4. Pulsa una celda (partido × tema). Se abre la vista de cruce:
   - Lista de todas las votaciones del tema en la legislatura XV.
   - Por cada votación: posición del partido (a favor, en contra o abstención), porcentaje de la mayoría de sus diputados y etiqueta Pleno o Comisión.
   - Si la mayoría es inferior al 80 %: «dividido (mayoritariamente a favor / en contra / abstención)».
   - Debajo, intervenciones de diputados del partido en las sesiones con votaciones relevantes para el tema: cita literal, resumen y enlace a la sesión. Si no hay ninguna: «Sin intervenciones registradas».
5. Desde la cuadrícula o desde una tarjeta de tema, el usuario abre la vista completa del tema: todas sus votaciones con la posición de cada partido.
6. Opcional, comparador: elige 2 o 3 partidos. Por cada tema ve si votaron igual o distinto. Si difieren, ve la votación y el voto de cada uno.
7. Opcional, calculadora: elige un conjunto de votaciones (un tema o una selección manual). Marca su voto en cada una (a favor, en contra, abstención o sin marcar). Elige uno o varios partidos. Obtiene, por partido, número y porcentaje de coincidencias con la posición mayoritaria del partido, sobre las votaciones marcadas. Cada coincidencia y discrepancia enlaza a la votación. El resultado solo vale para ese conjunto.
8. En cada respuesta, `<Fuentes />` enlaza a congreso.es o a la ficha de la votación en Reforma Digital.
9. El botón «¿Algo está mal? Avísanos» abre un issue en el repositorio.

## Funcionalidades

### Posiciones por tema (núcleo)

- **Cuadrícula de posiciones por tema** (principal): filas = temas, columnas = partidos, cada celda con la posición resumida en texto.
- **Vista de cruce** (celda partido × tema): votaciones del tema con posición, porcentaje, órgano e intervenciones asociadas.
- **Tarjeta por tema**: 3 a 5 votaciones clave en lenguaje claro, con la posición de cada partido. Icono y texto, nunca solo color.
- **Vista completa del tema**: todas las votaciones del tema con la posición de cada partido y enlace a la ficha de cada votación.

### Comparación

- **Comparador**: selección de 2 o 3 partidos; por tema, indicador de «votaron igual / distinto» y detalle de la votación en la que difieren.

### Voto individual

- **Voto por diputado por tema**: sentido del voto de cada diputado en cada votación del tema, con filtros por provincia y por partido. Si intervino ese día, muestra la intervención asociada.

### Participación del usuario

- **Calculadora de alineamiento con un partido**: flujo descrito en el apartado anterior. El voto del usuario vive solo en memoria (estado de React). No se guarda en servidor, `localStorage` ni cookies.

### Transversal

- Aviso «Herramienta experimental. No es un servicio oficial.» en todas las páginas.
- Botón «¿Algo está mal? Avísanos» en todas las páginas.
- Componente `<Fuentes />` en cada respuesta con enlace a la votación o sesión concreta.
- Atribución: Escaño Abierto (CC BY 4.0) y Reforma Digital (MIT), en cada página que usa datos.
- Fecha del volcado visible en la interfaz.
- `ficha.json`: `datos` pasa de `simulados` a `reales`; `fuentes` incluye Reforma Digital, Escaño Abierto y congreso.es.

### Reglas de cálculo (funciones puras en `src/lib/`, con tests)

- Posición de un partido en una votación: sentido mayoritario entre sus diputados que votan. Las ausencias no cuentan.
- Umbral único del 80 %: si la mayoría es igual o superior, es la posición del partido; si es inferior, «dividido».
- Alineamiento del usuario: coincidencia con la posición mayoritaria del partido; abstención del usuario tratada como sentido propio.
- Filtro de órgano: solo Pleno (los datos abiertos actuales no incluyen Comisión).

## Alcance

### Dentro del alcance (lo que construimos)

- Script TypeScript con Bun que genera el volcado versionado en `src/datos/` a partir de la API de Reforma Digital. Primera generación congelada para el hackatón. Ejecución manual, fuera del build.
- Cuadrícula de posiciones por tema (feature 1), con vista de cruce.
- Tarjetas por tema (feature 2) y vista completa del tema (feature 3).
- Comparador de partidos (feature 4).
- Voto por diputado con filtros por provincia y partido (feature 6).
- Calculadora de alineamiento en el navegador (feature 7).
- Legislatura XV únicamente.
- Partidos con grupo parlamentario propio (Grupo Mixto excluido).
- Pleno únicamente en los datos actuales.
- Tests de las reglas de cálculo.
- Elementos transversales: avisos, `<Fuentes />`, atribución, `ficha.json`, fecha del volcado.
- Componentes de `src/components/ui/` copiados desde `packages/design/ui/` de Reforma Digital; tokens de `src/styles/tema.css` sin cambios.

### Fuera del alcance (lo que no construimos)

- Coherencia promesas–votos (feature 5): el resultado de `promesas.py` no está publicado ni se puede descargar; requiere los PDFs de programas de 2023 y IA para extraer y juzgar.
- Candidaturas por provincia (feature 8): se hará después del 28 de octubre, como copia de la feature 6 con candidaturas reales.
- Grupo Mixto en la cuadrícula y en la calculadora.
- Legislaturas distintas de la XV.
- Encuestas (la API responde 451 durante la veda).
- Afinidad general en porcentaje, ranking de partidos o recomendación de voto.
- Llamadas a la API de Reforma Digital desde la aplicación en tiempo de uso o durante el build.
- Automatización del volcado con GitHub Action (queda para después).
- Base de datos, cuentas, login, analítica, cookies o cualquier almacenamiento del voto del usuario.
- Recolector en Python dentro de este proyecto: el proyecto es solo TypeScript.
- Reclasificación de temas con IA: se usa `tm` tal cual.
- Cambios en `datos/` y `comun/` (material de la organización).
- Nuevos colores, fuentes, radios o sombras.

## Criterios de éxito

Se considera hecho cuando se cumplen todos estos puntos:

1. `bun install --frozen-lockfile` y `bun run build` terminan sin errores. El build no hace llamadas de red.
2. `src/datos/` contiene el volcado generado por el script Bun, validado contra `voteSchema`, `sessionSchema`, `interventionSchema` y `monthSchema` de `schema.ts` de Reforma Digital. La fecha de generación se muestra en la interfaz.
3. La cuadrícula muestra los temas del campo `tm` y una columna por grupo parlamentario (sin Grupo Mixto), en orden alfabético, sin filtros previos.
4. Cada celda muestra la posición del partido o «dividido (mayoritariamente X)» si la mayoría es inferior al 80 %. El porcentaje de la mayoría aparece en cada votación.
5. Cada voto se indica con icono y texto (a favor, en contra, abstención). El contraste cumple WCAG AA, el foco es visible, se respeta `prefers-reduced-motion` y no hay scroll horizontal a 320 px.
6. Ninguna cita se muestra sin haber pasado la verificación de coincidencia literal con el Diario de Sesiones (`cita_verificada` del pipeline).
7. Cada intervención enlaza a su sesión; cada votación enlaza a su ficha oficial.
8. Los tests de las reglas de cálculo pasan. Como mínimo cubren: umbral del 80 %, mayoría, división, alineamiento del usuario y filtro solo Pleno.
9. Ninguna ruta de servidor recibe ni guarda el voto del usuario. Verificable: el DevTools no muestra escrituras en `localStorage` ni cookies, y no hay rutas `POST` para ello.
10. Ninguna pantalla ordena partidos por resultado ni muestra texto del tipo «tu partido es».
11. Cada página con datos muestra atribución (Escaño Abierto CC BY 4.0, Reforma Digital MIT), el aviso no oficial y `<Fuentes />`.
12. `ficha.json` tiene `datos: "reales"`.
13. El flujo principal (pasos 1 a 4) se puede demostrar en vivo el jueves 22 con el volcado congelado.
14. Antes del volcado, la API en vivo ha sido probada: rutas, nombres de conjuntos, meses de la XV y tamaños confirmados.

## Decisiones pendientes

- MVP del jueves: propuesta A (features 1 y 3). Pendiente de confirmar con el equipo.
- Calculadora: porcentaje global por partido (propuesta: no, solo por tema).
- Calculadora: pesos por tema (pendiente).
- Calculadora: estado «alineamiento no definible» para votaciones divididas (hoy cuenta la mayoría).
- Comisión: umbral y tratamiento de votaciones con 1 a 5 votantes por partido. Hoy no hay datos de Comisión en `votaciones.py`.
- Intervenciones: filtrar por `temas` de la IA o solo por sesión.
- Tono de las intervenciones generado por IA: revisión o etiquetado antes de publicar.
- Host base de la API de Reforma Digital para el volcado (probablemente `https://reforma-digital.es`).
- Enrutado de `/libre` en la plataforma BARRACA: confirmar con la organización.
- Reparto del trabajo por personas: lo decide el equipo.
