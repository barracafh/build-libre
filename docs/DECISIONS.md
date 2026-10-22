# Decisiones

Registro de las decisiones de producto y técnicas del proyecto. El formato de cada entrada (campos,
hora de Madrid, orden) está en «Decision records» de [AGENTS.md](../AGENTS.md), junto con las
reglas obligatorias.

## 2026-10-21 17:48 +02:00 · Mapa de partidos

- **Estado:** vigente
- **Contexto:** los grupos cambian de nombre desde 2023 (Plurinacional SUMAR pasa a Frente Abierto)
  y los datos solo traen el nombre de entonces.
- **Decisión:** `src/config/partidos.json` da a cada grupo su nombre actual, los anteriores, su
  color y su fuente; sin candidatos ni entrada para el Mixto.
- **Motivo:** el track deja fuera los candidatos; el color solo identifica al partido, como pide
  `DESIGN.md`.
- **Riesgo abierto:** ninguna fuente está comprobada (`fuente: null`) y los colores salen de los
  datos; falta la fuente oficial de cada nombre antes de mostrarlos.

## 2026-10-22 18:36 +02:00 · Capa de datos para la web

- **Estado:** vigente
- **Contexto:** `data/` copia Escaño Abierto tal cual; la web necesita votaciones, posiciones por
  partido y resultados por provincia limpios, con tipos y sin texto de IA mezclado.
- **Decisión:** `src/lib/datos.ts` lee `data/` en el build y da datos limpios; no se genera otra
  copia. Las reglas de limpieza están en su cabecera.
- **Motivo:** una sola fuente de datos y la limpieza probada en `src/lib/datos.test.ts`; los temas
  (`tm`) salen de palabras clave sin IA (`escano/temas.py`), así que sirven de filtro.
- **Alternativas:** un script que escriba JSON limpios en el repo; duplica datos y añade un paso
  que puede quedar desfasado.
- **Riesgo abierto:** sesiones e intervenciones (casi todo IA) no se exponen todavía.

## 2026-10-22 18:37 +02:00 · Posición del partido por tema

- **Estado:** vigente
- **Contexto:** el objetivo pasa de consultar votos a mostrar la posición de cada partido en temas
  predefinidos, con los hechos que la confirman.
- **Decisión:** la posición es la lista de votos y sesiones del partido en ese tema, sin etiqueta
  resumen; cualquier cifra es un recuento. Los temas son una lista fija.
- **Motivo:** una etiqueta («a favor», «en contra») sería una inferencia y rompería la regla de
  neutralidad; la lista deja que cada persona saque su conclusión.
- **Alternativas:** una etiqueta calculada por tema; se descarta por la misma razón.

## 2026-10-22 18:50 +02:00 · Lista fija de temas

- **Estado:** vigente
- **Contexto:** hace falta una lista cerrada de temas de interés ciudadano, de 20 como máximo.
- **Decisión:** 18 temas, todos etiquetas `tm` de Escaño Abierto (`TEMAS` en `src/lib/datos.ts`);
  `defensa` se une a `exteriores` y se quitan `cultura` y `tecnologia`.
- **Motivo:** las etiquetas salen de palabras clave sin IA y ya están en los datos; no añadimos
  ningún criterio editorial propio.
- **Alternativas:** temas nuevos con palabras clave propias (corrupción, dependencia); se
  descartan para no meter un criterio editorial.

## 2026-10-22 19:21 +02:00 · Vista por tema: matriz, ficha y tiras

- **Estado:** vigente
- **Contexto:** hay que enseñar la posición de cada grupo en un tema sin etiqueta resumen.
- **Decisión:** `/tema/[slug]/` con matriz iniciativa × grupo, ficha de recuentos por tipo y por
  proponente, y tiras temporales; votaciones agrupadas por iniciativa, enmiendas aparte.
- **Motivo:** cada fila fija el sentido de lo votado, así que se compara sin interpretar; los
  recuentos usan solo campos oficiales. Detalle en `docs/2026-10-22-1921-spec-vista-tema.md`.
- **Alternativas:** totales Sí/No por tema; mezclan propuestas de sentido opuesto.

## 2026-10-22 20:02 +02:00 · Prioridad de los documentos

- **Estado:** vigente
- **Contexto:** `AGENTS.md` decía que las reglas del concurso ganan siempre; el equipo quiere que
  manden sus propias reglas.
- **Decisión:** ante un conflicto gana `AGENTS.md`, luego `COMPETITION.md` y `SETUP.md`, luego
  `DESIGN.md` y estas decisiones.
- **Riesgo abierto:** la organización sigue juzgando con `COMPETITION.md`; lo que nos apartemos de
  él puede costar la candidatura.

## 2026-10-22 20:02 +02:00 · Colores de partido en las visualizaciones

- **Estado:** vigente
- **Contexto:** `COMPETITION.md` prohíbe añadir colores y la organización no ha aprobado los de
  partido.
- **Decisión:** las visualizaciones usan el color de `partidos.json` para identificar al partido,
  nunca el voto, con su nombre al lado y un borde de 1 px; reglas en `DESIGN.md`.
- **Riesgo abierto:** va contra una regla del concurso; conviene avisar a la organización antes de
  la demo.

## 2026-10-22 20:02 +02:00 · Estructura común del frontend

- **Estado:** vigente
- **Contexto:** varias personas hacen vistas distintas que tienen que verse como una sola web.
- **Decisión:** un shell con menú desde `src/config/vistas.ts`, una ruta por vista, componentes
  compartidos en `src/components/`, datos solo por `src/lib/datos.ts` y sin librería de gráficos.
- **Motivo:** cada persona integra su vista sin tocar lo común; detalle en «Frontend structure» de
  `AGENTS.md`.

## 2026-10-22 20:02 +02:00 · Flujo de ramas sin roles

- **Estado:** vigente
- **Contexto:** sin roles, cada persona lleva su vista; hay que evitar que una rama rompa lo común.
- **Decisión:** lo de una vista entra en `dev` cuando está hecha; lo compartido, por PR revisada
  por otra persona; cualquiera pasa `dev` a `main` tras avisar y pasar los checks.
- **Alternativas:** trabajar todos sobre `main`, como sugiere `COMPETITION.md`; cada push publica.

## 2026-10-22 20:02 +02:00 · Idioma del código

- **Estado:** vigente
- **Contexto:** el código mezclaba nombres en español e inglés.
- **Decisión:** rutas, textos, identificadores y ficheros del dominio en español; comentarios,
  tests, commits y PR en inglés; sin capa de i18n.
- **Motivo:** el código y la pantalla usan las mismas palabras (`votacion`, no `vote`).

## 2026-10-22 21:17 +02:00 · Integración del prototipo de estadísticas

- **Estado:** vigente
- **Contexto:** `codex/jorge` aporta un panel shadcn con Recharts solicitado por su propietario;
  `dev` añade portada, shell compartido y vista de temas.
- **Decisión:** conservar ambas vistas; el prototipo pasa a `/estadisticas`, con datos simulados
  explícitos y Recharts limitado a esa vista. Las vistas parlamentarias mantienen sus reglas.
- **Motivo:** integrar el trabajo de ambas ramas sin sustituir la portada ni presentar muestras
  ficticias como datos del Congreso. Los componentes del panel adoptan nombres kebab-case.

## 2026-10-22 21:24 +02:00 · Integración de Escáner desde el PR 12

- **Estado:** vigente
- **Contexto:** el propietario de `codex/jorge` solicita incorporar el contenido del PR #12
  como una nueva sección llamada Escáner.
- **Decisión:** integrar `/escaner`, su instantánea, generador y pruebas; añadir su acceso en
  `vistas.ts`, conservando Temas y Estadísticas.
- **Motivo:** disponer de la vista existente en la misma aplicación para su revisión.
- **Riesgo abierto:** se conservan las divergencias declaradas en el PR #12 (resúmenes de
  programas con IA, colores de voto, orden por brecha y carga completa del conjunto de datos).

## Pendiente

- Origen de los ficheros copiados a mano de upstream `data/` (commit `39a7426`): `data:fetch` borra
  los de `votaciones/` y `sesiones/`. Propuesta: que `fetch-data.ts` descargue solo los que use la
  web, en carpetas propias, y quitar el resto.
- ¿Se quedan en el repo las encuestas (`data/encuestas/`)? Propuesta: quitarlas; la web nunca puede
  mostrarlas.
- Votaciones sin tema. Propuesta: fuera de las vistas por tema, con su recuento en `/metodo/`.
