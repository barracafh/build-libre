# Track libre · Build night · BARRACA x SOTI

**Herramienta:** aquienconovoto2026 · «Qué votó cada partido en el Congreso durante la XV
legislatura, por tema y con su fuente oficial.»

## 1. Problema ciudadano

Antes del 29 de noviembre de 2026, quien vota oye en campaña afirmaciones sobre lo que hizo cada
partido («votó en contra de regular el alquiler») y no tiene una forma sencilla de comprobarlas con
el registro oficial.

- **Quién lo sufre:** cualquier persona con derecho a voto en las generales, sobre todo quien quiere
  contrastar lo que oye y no sabe leer los datos abiertos del Congreso.
- **Cuándo:** desde la disolución de las Cortes (6 de octubre de 2026) hasta el día de la votación,
  y con más fuerza durante la campaña, cuando se repiten afirmaciones sobre votaciones pasadas.
- **Qué falla hoy:** el registro oficial existe, pero está repartido en un fichero JSON por
  votación, sin tema ni buscador ciudadano. Además, una misma iniciativa pasa por varias
  votaciones (toma en consideración, enmiendas, convalidación), y un mismo grupo puede votar
  distinto en cada una.

La herramienta le deja ver, tema a tema, qué votó cada partido en la XV legislatura y cómo se
repartieron los votos y los escaños en 2023, con la fuente oficial en cada dato. Muestra hechos
comprobables; las conclusiones las saca cada persona. Nunca ayuda a elegir partido.

**Visión:** reunir en un solo sitio todos los datos públicos de la legislatura para que cualquiera
pueda explorarlos por su cuenta.

## 2. Fuente de datos

Enlaces probados el 21/10/2026.

- **Votaciones del Pleno (Congreso de los Diputados, datos abiertos):**
  https://www.congreso.es/es/datos-abiertos
  Ejemplo de una votación (sesión 27, 12/03/2024):
  https://www.congreso.es/webpublica/opendata/votaciones/Leg15/Sesion027/20240312/Votacion001/VOT_20240312204246.json
- **Resultados de las generales de 2023 (Ministerio del Interior, Infoelectoral):**
  https://infoelectoral.interior.gob.es/es/elecciones-celebradas/resultados-electorales/
- **Escaños de cada provincia en 2026 (BOE, Real Decreto 806/2026):**
  https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-20742
- **Reparto de escaños (BOE, LOREG, art. 163):**
  https://www.boe.es/buscar/act.php?id=BOE-A-1985-11672
- **Escaño Abierto** (código MIT, datos CC BY 4.0), que reúne esas votaciones por mes y les asigna
  tema, fijado al commit `365e56d`:
  https://github.com/jorgegarcelan/escano-abierto/tree/365e56d6de9f4ad5da9c9a022f4c7ccf6c07a031

**Datos:** reales y públicos. Son 2.265 votaciones del Pleno (agosto de 2023 a octubre de 2026) y
los resultados de 2023 en las 52 circunscripciones, guardados en el repo. La herramienta no
consulta ninguna API en directo. Siempre que existe, se cita la fuente oficial: cada votación
enlaza a su JSON en congreso.es, y Escaño Abierto se cita solo por lo que no publica ninguna
fuente oficial, como el tema de cada votación. No se pide ni se guarda ningún dato personal: los
filtros se resuelven en el navegador.

## 3. Demo de 3 minutos

Tarea de ejemplo: *«He oído que un partido votó en contra de regular el alquiler. Quiero
comprobarlo.»*

En el vídeo de la demo los partidos son inventados («Partido A», «Partido B»…) y se indica en
pantalla que los datos son simulados. En la web se ven los grupos reales, todos a la vez y en orden
alfabético.

1. **0:00–0:30 · Cómo se repartieron los votos en las últimas elecciones.** En Valencia: votos de
   cada candidatura en 2023, escaños que obtuvieron y electores por escaño en 2023, con su fuente
   oficial.
2. **0:30–1:00 · Comprueba lo que has oído.** La persona elige el partido y el tema «Vivienda», o
   escribe «alquiler».
3. **1:00–1:45 · Las votaciones.** Aparecen las votaciones de ese partido sobre el tema, con su voto
   en cada una (sí, no, abstención o no vota) y sin ningún veredicto. Se ve que la regulación del
   alquiler de temporada pasó por varias votaciones: por ejemplo, el Partido A votó no en la toma en
   consideración de septiembre de 2024, sí en la de diciembre de 2024 y no en la convalidación de
   abril de 2026. La afirmación es cierta o falsa según qué votación se mire, y la persona lo ve por
   sí misma.
4. **1:45–2:30 · Una votación.** Resultado, voto de cada grupo en orden alfabético (con marca y
   texto, nunca solo color; una abstención se muestra como abstención) y voto de los diputados de
   Valencia.
5. **2:30–2:50 · La fuente.** «Fuentes» abre el JSON oficial de esa votación en congreso.es, con las
   mismas cifras.
6. **2:50–3:00 · Cierre.** Aviso «Herramienta experimental. No es un servicio oficial.», botón
   «¿Algo está mal? Avísanos» y la misma pantalla a 320 px.

## 4. Encaje con los otros cinco tracks

| Track | Qué cubre | Por qué no se solapa |
| --- | --- | --- |
| Brújula | Qué trámite necesito y el siguiente paso | Aquí no hay trámites, solo el registro de votaciones y los resultados de 2023. |
| Derechos | Ayudas y convocatorias | No trata ayudas ni requisitos. |
| Claridad | De un PDF o una notificación a una checklist | No procesa documentos del ciudadano. |
| Sello + estafas | Si una web o un mensaje es oficial | No verifica webs ni mensajes. «Comprueba lo que has oído» no da veredicto: muestra votaciones. |
| ¿Cómo voto? (29N) | Cómo se vota: voto por correo, censo, plazos y método de reparto | Aquí no se explica cómo se vota ni hay calendario. Mostramos datos pasados: qué votaron los partidos en el Congreso y cómo se repartieron los votos y los escaños en 2023, provincia a provincia. |

**Neutralidad:** nada de «¿a quién voto?», ni tests de afinidad, programas, candidatos, encuestas
o proyecciones. De 2026 solo se muestra cuántos escaños elige cada provincia. Los partidos siempre
van en orden alfabético. Las cifras sobre diputados son solo recuentos, sin ordenar y sin
calificativos. El Grupo Mixto no se trata como un partido. El texto generado por IA en Escaño
Abierto (motivos de voto, resúmenes) aparece etiquetado como generado, junto al registro oficial, y
nunca sirve para filtrar.
