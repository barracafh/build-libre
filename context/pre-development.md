## Decisiones tomadas (sesión de definición, 21/10)

- Stack: Next.js (App Router), React, TypeScript, Bun. Lo fija el repo base.
- Base de datos: ninguna por defecto. Permitida si hace falta; sin uso definido.
- Datos: volcado JSON versionado en el repo, generado por script TypeScript (Bun), no Python. Ubicación: `src/datos/` (no `datos/`, que es material de la organización). La app no llama a la API en vivo.
- Alcance: features 1-8 en el plan; la 5 y la 8, fuera del hackatón. Se construyen una a una, hasta donde se llegue, con arquitectura pensada para el alcance completo.
- Features 5 y 7: dentro del plan. Su conflicto con las normas (`AGENTS.md`, revisión de la organización) se resuelve más adelante con la organización. Mientras, se tratan como incluidas.
- Prioridad del hackatón: lo demostrable el jueves 22 sin romper el build.
- Tests: se testea todo lo relevante. El detalle de los tests se define más adelante, al avanzar en el desarrollo (decidido).
- Repo original: `C:\Users\adrik\Projects\reforma-digital`, monorepo. Reforma Digital en `apps/web` y el pipeline en `apps/ingestion/escano`.
- Feature 5 (promesas–votos): fuera del hackatón. Verificado con el repo local `reforma-digital`: existe `apps/ingestion/escano/promesas.py` (pipeline v1, programas del 23J), pero el resultado no está en el repo ni se publica (sin referencias en web ni API). Necesita los PDFs de programas 2023 y la IA (NaN) para extraer y juzgar. Se reabre si se consiguen esos insumos.
- Actualización del volcado: script TypeScript en el repo, ejecutable a mano cuando haga falta. Primera generación congelada para el hackatón. Automatizarlo con GitHub Action queda para después. La fecha del volcado se muestra en la interfaz (decidido).
- Autenticación y acceso: sin cuentas ni login. Datos públicos de lectura. Analítica: ninguna. Sin seguimiento de ningún tipo (decidido).
- Orden de trabajo: en paralelo cuando se pueda, por personas distintas. Si es en serie: B (cuadrícula con volcado de prueba), luego A (pipeline de datos), luego C (reglas de cálculo con tests). Nota: B necesita al menos una muestra real de la API, que se obtiene en el primer paso de A.
- Pleno y Comisión: se incluyen ambos. Cada votación lleva una etiqueta que indica el órgano (Pleno o Comisión). Decidido.
- Comisión: mismo umbral del 80% que en Pleno, por ahora. Pendiente de tratar más adelante: votaciones de comisión con pocos votantes, donde un voto discordante marca el partido como dividido.
- Flujo de entrada: cuadrícula directa, sin navegación previa ni filtros. Todos los temas visibles (decidido).
- Flujo de celda: pulsar un cruce partido × tema abre la vista de cruce (ver feature 1).
- Citas: selección por IA (decidido). Literal de la transcripción, nunca inventada ni interpretada. Supuesto del equipo: ninguna cita del orador contradice la postura del partido; como mucho puede ser menos representativa. Vigilar en la demo. Verificado en el repo: `apps/ingestion/escano/analisis.py` (`cita_verificada`) descarta toda cita que no aparezca literalmente en el Diario de Sesiones.
- Relevancia de votación para tema: criterio de Temas de Reforma Digital (campo `tm`). Resuelto: `temas.py`, por palabras clave, sin IA.
- Legislatura: solo la última (XV), sobreentendida. Los datos de Reforma Digital ya se limitan a ella.
- Grupo Mixto: fuera de la cuadrícula y de la calculadora por ahora.
- Posición de un partido en una votación: sentido mayoritario entre sus diputados que votan. Ausencias no cuentan. Tres sentidos (a favor, en contra, abstención), con las mismas reglas para los tres.
- Umbral del 80%: alineado con Reforma Digital (`votaciones.py`, `posicion_grupo`), para que las celdas coincidan con su fuente. Decidido. El argumento anterior de los 15 escaños (90%) queda descartado.
- Umbral único: 80%. Si el sentido mayoritario es 80% o más, es la posición del partido, con su porcentaje. Si es menos de 80%, el cruce se marca como "dividido (mayoritariamente a favor / en contra / abstención)". Nota visible en la interfaz: el umbral coincide con Reforma Digital.
- Calculadora (feature 7), votos divididos: por ahora cuenta el sentido mayoritario del partido. El resultado indica que el usuario está alineado con la mayoría de los votos que emitió ese partido. Pendiente de revisar: estado especial "alineamiento no definible" para estos casos.
- Feature 8 (candidaturas): más adelante, no se desarrolla en el hackatón. Con diputados actuales no tiene sentido: la feature 6 ya muestra su posición individual. Tras el 28 de octubre será una copia de la 6 con candidaturas reales.
- Intervenciones: asociadas a sesión, no a votación. La vista de cruce muestra intervenciones de sesiones donde se votó una votación relevante para el tema.

## Preguntas abiertas

- MVP del jueves: pendiente de confirmar (propuesta A: features 1 y 3).
- Filtro de temas: descartado (cuadrícula sin filtros, todos los temas visibles).
- Selección de cita: resuelto. La IA selecciona, la verificación literal ya existe en el pipeline. Supuesto aceptado: las intervenciones están alineadas con la votación del partido. Comprobación con el campo `posicion`: aplazada, no se gestiona en esta fase.
- Relevancia: resuelto. `tm` lo asigna `temas.py` por palabras clave, sin IA, a votaciones, leyes y puntos del orden del día. Pendiente: las intervenciones llevan `temas` del análisis de IA (`construir.py`), no `tm`. ¿Filtramos por ese campo o solo por sesión?
- Grupo Mixto: fuera por ahora (decidido).
- División interna: umbral único 80% (decidido). Por debajo, "dividido (mayoritariamente X)". Mínimo de diputados: sin efecto con el umbral del 80%.
- Calculadora (feature 7), votos divididos: cuenta la mayoría por ahora. Pendiente de revisar: estado especial "alineamiento no definible".
- Umbral: resuelto. Se usa el 80% de Reforma Digital (decidido). Pendiente: revisar los tests de la función de umbral al cambiarlo.
- Pleno y Comisión: ambas, con etiqueta de órgano (decidido). Umbral: el mismo 80% por ahora. Pendiente de tratar más adelante: votaciones de comisión con pocos votantes (1 a 5 por partido), donde un voto discordante marca dividido. Verificado: `votaciones.py` solo trae votaciones del Pleno (datos abiertos del Pleno). Con este dataset no hay votaciones de Comisión, así que la etiqueta de órgano no tiene datos que mostrar. Revisar la decisión C.
- Feature 7, pesos por tema: pendiente (`proposal.md` dice que el usuario los elige; este documento lo deja abierto).
- Feature 7, porcentaje global por partido: pendiente (`proposal.md` lo deja abierto; propuesta: solo por tema).
- Candidaturas (feature 8): más adelante, no en el hackatón. Tras el 28/10 será copia de la 6. Pendiente: confirmar provincia de cada diputado en la API.
- Tono de intervenciones generado por IA: revisión o etiquetado antes de publicar.
- Verificar la API en vivo: primera tarea técnica, antes del volcado.

## Plan de trabajo (paralelo)

Primer paso común, antes de separarse: acordar el contrato del volcado. Esquema JSON de votaciones (voto por diputado, grupo, órgano, `tm`), sesiones e intervenciones. Sin contrato, los tracks no avanzan en paralelo. Estimación: 1 hora.

Tracks en paralelo:

- **T1 Datos (crítico)**: probar la API en vivo; script TypeScript que genera `src/datos/` con fecha; primera generación congelada. Sin dependencias. Entrega: volcado + fecha.
- **T2 Reglas de cálculo**: funciones puras en `src/lib/` (posición con 80%, mayoría, división, alineamiento, solo Pleno), con tests. Sin dependencias: se desarrollan con fixtures que siguen el contrato. Entrega: funciones + tests.
- **T3 Interfaz base**: cuadrícula (feature 1) y tarjetas (feature 2) con fixture. Depende del contrato. Se conecta a T1 al entregar el volcado.
- **T4 Transversal**: aviso «Herramienta experimental», `<Fuentes />` en cada respuesta, `ficha.json`, atribución (Escaño Abierto CC BY 4.0; Reforma Digital MIT), fecha del volcado visible. Sin dependencias.

En serie (dependen de T1, T2 y T3):

- Vista de cruce (detalle de la feature 1) y vista completa de tema (feature 3): T1 (sesión → votaciones relevantes por `tm`, intervenciones) + T3.
- Comparador (4) y calculadora (7): T2 + T3.
- Votos por diputado (6): T1. Medir antes el tamaño del volcado de votos por diputado.

Cadena crítica: contrato → T1 → vista de cruce.

Reparto por personas: pendiente, lo decide el equipo. No se toca `datos/` ni `comun/`.

## Estructura de Reforma Digital (estado actual)

Observado navegando reforma-digital.es/congreso. No verificado contra el código: revisar en github.com/samuelcorsan/reforma-digital (ahí probablemente estén la lista de tipos de votación y de tonos).

Entidades básicas:

- **Sesiones**: son las sesiones del Congreso, divididas en Pleno y Comisión. Diferencia entre ambos: Pleno (350 diputados) y Comisión (subconjunto por materia). Dentro de cada sesión hay:
  - Votaciones.
  - Transcripción del orden del día y transcripción completa del debate.
  - "Qué se dijo": cards con el resumen de cada intervención destacada (ver más abajo).
- **Votaciones**: cada una pertenece a una sesión o comisión. Hay varios tipos; lista completa por confirmar. Tipos vistos:
  - Validación de real decreto-ley
  - Proposición no de ley
  - Moción
  - Dictamen de la Comisión de Asuntos Exteriores sobre convenios internacionales
  - Solicitud de prórroga de subcomisiones
  - Dictamen a vocación de iniciativas legislativas
  - Toma en consideración
- **Leyes**: pueden ser proposición de ley o proyecto de ley (filtro en la web). Cada card muestra estado y fecha de presentación, pero muchas aparecen vacías. Solo hay un enlace al expediente en la web del Congreso; no hay ficha propia suficiente.
- **Temas**: agrupan la actividad parlamentaria por área. Lista vista en la web: campo pesquero y alimentación, clima y medio ambiente, empleo y trabajo, derechos sociales y consumo, cultura, deporte y medios, defensa, energía, sanidad, igualdad y violencia de género. Cada tema tiene tres pestañas:
  - Votaciones: sí se listan como cards (p. ej. Defensa: 30, de tipos mixtos: moción, con validación de real decreto, ley, proposición no de ley).
  - Iniciativas y Preguntas: la web muestra el número, pero no lista ninguna. No aparecen como tal.
- **Preguntas al Gobierno**: cards de preguntas por escrito con enlace al expediente en la web del Congreso. No se puede abrir más detalle dentro de Reforma Digital.
- **Diputados y grupos**: relación uno a uno entre diputado y grupo, salvo el Grupo Mixto, que agrupa diputados de origen distinto (ej. Ortega Smith y Johnny Belarra).
- **Qué se dijo**: card por intervención dentro de un debate concreto. Contiene:
  - Nombre de la persona y grupo al que pertenece (o si es del Gobierno).
  - Debate al que responde (p. ej. la votación de derogación o convalidación de un real decreto-ley).
  - Tono: combativo, propositivo, defensivo, crítico (lista completa por confirmar).
  - Resumen breve de lo que dijo, y a veces una cita representativa de esa posición.

Pendiente de confirmar:

- Lista completa de tipos de votación y de tonos (buscar en el código).
- El texto original habla de 21 temas fijos; en la web se ven 9. Revisar si son todos o si el resto está oculto.
- Por qué Iniciativas y Preguntas por tema muestran número sin listar elementos.

## Funcionalidades del track

Funcionalidad principal (núcleo, sobre la que se trabaja con más fuerza) y funcionalidades aparte. Las aparte solo se hacen si el núcleo está verificado. Estado: si hay tiempo → 2, 3, 4, 6 y 7. Fuera del hackatón → 5 y 8.

### 1. Cuadrícula tema × partido (PRINCIPAL)

- Filas: los 21 temas (campo `tm`): vivienda, sanidad, educación, pensiones, empleo, impuestos, energía, clima, campo, igualdad, inmigración, seguridad, justicia, defensa, política exterior, territorio, transporte, cultura, derechos sociales, tecnología, democracia.
- Columnas: un partido por columna, en orden alfabético. Sin Grupo Mixto.
- Celda: texto resumen de la posición del partido sobre ese tema. Lo genera una IA a partir de datos reales del Congreso (votaciones del tema y razones de voto). Se muestra etiquetado como generado y enlaza a las votaciones de origen.
- Sin filtros previos: todos los temas y partidos visibles desde la entrada.
- Móvil a 320 px sin scroll horizontal. Votos con icono y texto, nunca solo color.

#### Vista de votaciones de la celda (sección 1)

- Al pulsar una celda (partido × tema) se abre una vista con tantas cards como votaciones del tema haya en la XV.
- Cada card muestra el nombre de la votación y, debajo, el sentido del voto mayoritario del partido en esa votación.
- Cada card enlaza a la votación oficial en congreso.es.

#### Vista de citas (sección 2, debajo de las votaciones)

- Cards con citas textuales de intervinientes del partido en las sesiones donde se produjeron las votaciones de la sección 1.
- Cada cita representa una justificación del sentido del voto del partido del orador en esa votación.
- Cada card muestra la cita, el orador, la fecha y un enlace a la sesión.
- Si no hay intervenciones: «Sin intervenciones registradas».
- Solo se muestran citas literales verificadas (regla 6 de `AGENTS.md`). Ver P3 en la sección de preguntas abiertas.

#### Reglas de la funcionalidad principal

- Posición del partido: sentido del voto mayoritario entre sus diputados que votan.
- El texto de celda es neutral: sin calificativos («rebelde», «leal», «mejor», «peor») y sin juzgar el voto.

### Funcionalidades aparte (fuera del núcleo)

Descripciones originales, sin cambios. Solo se empiezan si el núcleo está verificado.

### 2. Tarjeta por tema (vistazo)

- Una tarjeta por tema con 3 a 5 votaciones clave, en lenguaje claro.
- Por cada votación, la posición de cada partido: a favor, en contra o abstención, con el porcentaje de la mayoría de sus diputados.
- Partidos en orden alfabético. Lectura completa en móvil.
- El voto nunca se indica solo con color: icono y texto.

### 3. Vista completa del tema

- Al pulsar la tarjeta se abren todas las votaciones del tema, con la posición de cada partido en cada una.
- Fuente: enlace a la ficha de Reforma Digital de cada votación (voto de cada diputado), o la fuente directa.
- Pendiente: si basta con esa lista o hace falta algo más.
- Dato actual: en Temas, Reforma Digital muestra las votaciones con totales (síes, noes, abstenciones, no vota), pero no el voto por grupo. Solo se ve dentro de cada votación. Esto es lo que falta.

### 4. Comparador

- El usuario elige 2 o más partidos.
- Por tema, un deslizador o indicador: votaron igual o distinto.
- Si difieren, se indica en qué votación y qué votó cada uno.
- Pendiente: cómo representar visualmente las diferencias.

### 5. Coherencia promesas–votos (fuera del hackatón)

- Mide hasta qué punto un partido ha sido coherente con las promesas de su programa de la campaña anterior (2023), según las votaciones de la legislatura.
- Para cada promesa: las votaciones relacionadas y la posición del partido en cada una (a favor, en contra, abstención).
- Estado por promesa: coherente, incoherente, sin votación relacionada o no evaluable. Cada estado enlaza a sus votaciones.
- No mide si la promesa se cumplió en el Gobierno ni valora el programa; solo contrasta el voto del partido con lo que prometió.
- Punto de partida: promesas.py, ya existente pero no publicado en la web (ver sección de estructura).
- Pendiente: confirmar si los datos son descargables; definir criterios de "coherente" e "incoherente" por promesa; decidir si se incluye el programa completo o solo las promesas extraídas.

### 6. Voto de cada diputado por tema

- Por tema, el sentido del voto de cada diputado en cada votación.
- Resumen de la posición del diputado en el tema.
- Si intervino el día de la votación, detalle de esa intervención y de sus matices.
- Filtros por provincia y por partido.

### 7. Calculador de alineamiento con un partido

- Compara el voto del usuario con el voto de un partido en un conjunto acotado de votaciones del Congreso. No evalúa al usuario contra todos los partidos ni da una afinidad general.
- Flujo:
  - El usuario elige un conjunto de votaciones (p. ej. las de un tema, o una selección manual).
  - Marca su sentido del voto en cada una: a favor, en contra o abstención. Puede dejar votaciones sin marcar.
  - Elige uno o varios partidos. Se muestran en orden alfabético.
- Posición de un partido en una votación: sentido mayoritario de sus diputados. Un diputado que vote distinto no cambia la posición del grupo mientras la mayoría sea 80% o más. Se muestra el porcentaje de la mayoría.
- Resultado por partido: número y porcentaje de votaciones marcadas en las que el usuario coincide con la posición mayoritaria del partido, sobre el total de votaciones marcadas.
- Cada coincidencia y cada discrepancia enlaza a la votación de referencia (ficha de Reforma Digital con el voto de cada diputado).
- Reglas: sin ganador, sin ranking entre partidos, sin "tu partido es…", sin afinidad general. El resultado solo vale para el conjunto de votaciones elegido.
- El voto del usuario se calcula en el navegador y no se guarda.
- Votos divididos: se compara con el sentido mayoritario del partido, y el resultado se indica como alineamiento con la mayoría de sus votos emitidos. Pendiente de revisar: estado especial "alineamiento no definible".
- Pendiente: si se mantienen pesos por tema (solo tendrían sentido dentro de un conjunto acotado); qué hacer con votaciones de procedimiento o sin posición mayoritaria clara; cómo mostrar abstenciones del usuario frente a la posición del partido.

### 8. Candidaturas: tu provincia y España (más adelante)

- Muestra candidaturas por provincia y a nivel nacional, con su relación con votaciones de la legislatura.
- No se desarrolla en el hackatón. Con diputados actuales no tiene sentido: la feature 6 ya muestra su posición individual.
- Tras la publicación de candidaturas (28 de octubre): copia de la feature 6 con candidaturas reales. Pendiente: fuente y formato de las listas.
- Pendiente: confirmar que la API da la provincia de cada diputado.
- Pendiente: qué se muestra por candidato (quién repite y cómo votó, según `proposal.md`).

## Reglas generales

- Cualquier listado de partidos se muestra en orden alfabético, sin priorizar ninguno. Aplica a la cuadrícula, a las tarjetas, al comparador, a los resultados y a cualquier otra lista.
- Los resultados son consultivos.

## Arquitectura y diseño de código

Base: repo `build-libre` (plantilla del track). Todo el desarrollo sigue sus reglas, su estructura y su stack.

### Stack

- Next.js 16.4 (App Router), React 19.3, TypeScript, Tailwind 4.3, Bun. Node 22 o superior.
- Publicación: cada push a `main` se publica en `https://build.barraca.house/libre`. `bun run build` tiene que pasar o no se publica.
- Ruta base `/libre` (`basePath`). Para `fetch` propios e imágenes de `public/`, usar `ruta()` de `src/config/sitio.ts`.
- Instalar con `bun install --frozen-lockfile`. Componentes nuevos solo con `bunx shadcn@4.22.1 add <componente>`. No usar `--overwrite` ni `shadcn init`.
- Python no forma parte de este proyecto. El recolector de Reforma Digital (Python, Postgres, Vercel Blob) no se porta.

### Frontend y backend

- Frontend: React con Server Components por defecto y Client Components donde haga falta interacción (cuadrícula, filtros, calculador).
- Backend: solo Route Handlers en `src/app/api/` y lógica de servidor en `src/lib/`. Ninguna clave con prefijo `NEXT_PUBLIC_`.
- Cálculos (alineamiento, coherencia, cuadrícula): funciones puras en `src/lib/`, testeables sin interfaz.

### Base de datos

- Ninguna por defecto. Permitida si hace falta (sin uso definido). Solo se leen datos públicos de Reforma Digital, volcados en el repo.
- Motivo: la plantilla prohíbe guardar texto del ciudadano (ni BD ni logs). Como no hay escritura, no hay necesidad de BD.
- El voto propio del usuario (feature 7) vive solo en memoria, en el estado de React. No se guarda en servidor ni en `localStorage`.

### Componentes y diseño

- Componentes de `src/components/ui/` copiados (no importados) de `packages/design/ui/` de Reforma Digital, shadcn/ui con Base UI. Origen en `AVISO.md` (MIT, commit `8ca1935`).
- Tokens en `src/styles/tema.css`. No cambiar valores ni añadir colores, fuentes, radios o sombras.
- Sin logotipos ni nombre de Reforma Digital ni de la Administración.
- Votos siempre con icono y texto, nunca solo color. Contraste AA, foco visible, `prefers-reduced-motion`.
- Sin scroll horizontal a 320 px.

### Datos de Reforma Digital

Endpoints públicos de lectura (CORS, sin clave):

- `GET /api/congreso/datasets/<ruta>.json`: conjuntos publicados completos.
- `GET /api/congreso/votaciones/<id>`: votación con el voto de cada diputado (`votos`: diputado, grupo, voto).
- `GET /api/congreso/votaciones?legislatura=XV&pagina&limite&q&desde&hasta`: listado. Máximo 100 por página. No filtra por tema.
- `GET /api/congreso/sesiones` y `GET /api/congreso/sesiones/<DSCD-id>`: sesión con intervenciones (orador, grupo, tono, temas, cita, resumen).
- `GET /api/congreso/descarga`: tar.gz completo.

Verificado en el repo local (`apps/web/app/api/congreso/[[...path]]/route.ts` y `apps/web/lib/congreso/schema.ts`):

- Raíz `GET /api/congreso`: devuelve `conjuntos` (path, sha256, updated_at), `publicacion` y `endpoints`. Es el punto de partida. Los nombres de los conjuntos viven en base de datos, no en el repo.
- `datasets/indice.json`: índice común (grupos, diputados, meses disponibles).
- `datasets/AAAA-MM.json`: un fichero por mes, con `sesiones`, `votaciones` e `intervenciones` (esquema `monthSchema`). Es el candidato natural para el volcado de la XV: se recorre la lista de meses del índice.
- Otros conjuntos con esquema propio: `leyes.json`, `preguntas.json`, `organigrama.json`, `semanas.json`, `geografia/territorios.json`, `elecciones/*`. Los `encuestas/*` no se usan.
- Paginación en `votaciones`, `preguntas` y `sesiones`: `pagina` (máx. 10000) y `limite` (por defecto 24, máx. 100). Filtros: `legislatura`, `desde`, `hasta`, `q`, `estado`. No hay filtro por `tm`.
- Contrato: `schema.ts` ya define `voteSchema`, `sessionSchema`, `interventionSchema` y `monthSchema`. El volcado valida contra esos esquemas, no los redefine.
- Pendiente: confirmar en la API en vivo los nombres de conjuntos y los meses de la XV. El repo no contiene datos.

Campos y reglas útiles:

- Temas: campo `tm` en votaciones, leyes e intervenciones. Son 21 temas por palabras clave (vivienda, sanidad, educación, pensiones, empleo, impuestos, energía, clima, campo, igualdad, inmigración, seguridad, justicia, defensa, política exterior, territorio, transporte, cultura, derechos sociales, tecnología, democracia). La web muestra 9; el código tiene 21. Usar `tm` directamente, sin clasificar de nuevo.
- Tono de las intervenciones: lo genera una IA (`ia.provider`, `ia.model`). No hay lista cerrada en el código. Mostrar siempre que es un análisis automático y no verificado.
- Encuestas: el endpoint responde 451 durante la veda. No las usamos.
- Caché: la API responde con cabeceras de caché de 5 a 60 segundos según la ruta.

### Origen de los datos (decidido: B, volcado en repo)

Decidido: volcado JSON versionado en `src/datos/`, generado por script TypeScript (Bun). La app no llama a la API en vivo. Pendiente: medir tamaños antes de generar.

Opciones evaluadas (referencia):

- A. Fetch en build (Server Components). Datos frescos, pero si la API cae el build falla y no se publica.
- B. Snapshot JSON en `src/datos/`, con script de refresco. Build estable, datos con fecha. Recomendado.
- C. Fetch en cliente. Sin dependencia en build, pero más carga y dependencia en tiempo de uso.
- Pendiente: medir el tamaño de los conjuntos antes de generar el volcado.

### Publicación (verificado en los repos)

- `build.barraca.house` es un dominio compartido. Cada equipo sirve su app bajo `/<equipo>` (aquí `/libre`). El enrutado entre apps lo hace la plataforma BARRACA, fuera de ambos repos. En `reforma-digital` no hay configuración de despliegue que lo haga.
- `next.config.ts` fija `basePath` = `/libre`. Todo enlace, asset y fetch lleva ese prefijo. Por eso existen `<Link>` y `ruta()`.
- Publicación: cada push a `main` se publica si `bun run build` pasa (`AGENTS.md`). `vercel.json` declara Next.js, `bun install --frozen-lockfile` y `bun run build`. El dominio es el de la plataforma; confirmar qué hosting lo sirve.
- `reforma-digital` es otra app, con su propia base de datos y su dominio (reforma-digital.es). Nuestra app no la sirve ni la sustituye: solo consume su API pública.
- Pendiente de confirmar con la organización:
  - Cómo enruta la plataforma `/libre`.
  - El host base de la API de Reforma Digital para el volcado. El documento no lo define; probablemente `https://reforma-digital.es`.
  - Que el build no hace llamadas de red. El volcado sí las hace, y se ejecuta fuera del build.

### Atribución y fuentes

- Escaño Abierto: CC BY 4.0. Reforma Digital: MIT. Citar ambos en cada página que use los datos.
- Cada respuesta lleva `<Fuentes />` con enlace a la votación o sesión concreta (congreso.es o ficha de Reforma Digital).
- `ficha.json`: `datos` pasa de `simulados` a `reales`. Actualizar `fuentes` con Reforma Digital, Escaño Abierto y congreso.es.
- Aviso «Herramienta experimental. No es un servicio oficial.» y botón «¿Algo está mal? Avísanos» en todas las páginas.

### Límites conocidos

- La API en vivo no se ha podido probar desde la sesión de desarrollo (bloqueo de red). Confirmar rutas y tamaños antes de implementar. Primera tarea técnica: probarla antes del volcado.
- Los datos de promesas (`promesas.py`) no son descargables todavía. Confirmar.
- Track: todo lo anterior vale solo si el alcance pasa la revisión de la organización (ver sección de features 5 y 7).
