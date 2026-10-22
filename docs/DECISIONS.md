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

## Pendiente
