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

## 2026-10-22 19:36 +02:00 · Tres niveles: tema, cuestión, votación

- **Estado:** vigente
- **Contexto:** 2185 votaciones con solo 21 temas (`tm`); vivienda tiene 86, demasiadas para
  leerlas en bruto, y votaciones de signo contrario pueden expresar la misma línea.
- **Decisión:** tema → cuestión → votación. Las cuestiones son reglas de palabras clave sobre
  título y texto oficial en `src/datos/cuestiones.json`, sin IA; gana la primera que cumple y el
  resto va a «Otras». Los temas sin reglas se agrupan por iniciativa.
- **Motivo:** deterministas y revisables; por cuestión se ve el conteo de cada partido (a favor,
  en contra, abstención, dividido) y se baja a cada votación con su fuente.
- **Alternativas:** agrupar con IA (no verificable); listar todas (ilegible).
- **Riesgo abierto:** las reglas cubren pocos temas; completar el resto y revisar que ningún
  nombre de cuestión implique una postura.

## 2026-10-22 19:37 +02:00 · Sin programas electorales; sí lo defendido en el pleno

- **Estado:** vigente
- **Contexto:** se quería enfrentar el programa de 2023 con los votos, pero `data/promesas/` solo
  trae 704 promesas de 4 partidos, sin fuente ni cruce con expedientes; `SETUP.md` los excluye.
- **Decisión:** sin programas. Por tema, lo que cada grupo defendió en el pleno (`propuestas.json`
  de `data/normalizacion/`): cita, orador, fecha y Diario de Sesiones, como resumen automático.
- **Motivo:** cada cita tiene fuente oficial y se cumplen las reglas de neutralidad y fuentes.
- **Riesgo abierto:** incorporar los PDF de 2023 exige otro pipeline y decidirlo con la
  organización.

## 2026-10-22 19:57 +02:00 · Vista por grupo sobre iniciativas y entrada por temas de interés

- **Estado:** vigente
- **Contexto:** votación a votación no se entiende qué ha votado cada grupo: las mociones se votan
  por puntos con el mismo título, y el ciudadano quiere ver en minutos su línea en sus temas.
- **Decisión:** votaciones agrupadas en iniciativas con su proponente; cada tema lista por grupo
  «A favor de / En contra de / Se abstuvo en» con frases de plantilla (sin IA). Ver `/comparar`.
- **Motivo:** la iniciativa y su proponente dicen la línea sin que la herramienta la interprete; el
  selector es de temas, no de opiniones: no es test de afinidad ni orienta el voto.
- **Alternativas:** índice de cumplimiento o % de apoyo (presupone una dirección correcta;
  prohibido); resumen por grupo con IA (no verificable).
- **Riesgo abierto:** revisar que ninguna frase de plantilla califique («apoya», «rechaza») y
  decidir si el pie de `/comparar` necesita avisar de que no recomienda voto.

## Pendiente
