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

## Pendiente

- Origen de los ficheros copiados a mano de upstream `data/` (commit `39a7426`): `data:fetch` borra
  los de `votaciones/` y `sesiones/`. Propuesta: que `fetch-data.ts` descargue solo los que use la
  web, en carpetas propias, y quitar el resto.
- ¿Se quedan en el repo las encuestas (`data/encuestas/`)? Propuesta: quitarlas; la web nunca puede
  mostrarlas.
- Votaciones sin tema. Propuesta: fuera de las vistas por tema, con su recuento en `/metodo/`.
