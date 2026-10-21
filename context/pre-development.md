## Estructura de Reforma Digital (estado actual)

Observado navegando reforma-digital.es/congreso. No verificado contra el código: revisar en github.com/samuelcorsan/reforma-digital (ahí probablemente estén la lista de tipos de votación y de tonos).

Entidades básicas:

- **Sesiones**: son las sesiones del Congreso, divididas en Pleno y Comisión. Diferencia entre ambos: por confirmar. Dentro de cada sesión hay:
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
- Diferencia real entre Pleno y Comisión.
- El texto original habla de 21 temas fijos; en la web se ven 9. Revisar si son todos o si el resto está oculto.
- Por qué Iniciativas y Preguntas por tema muestran número sin listar elementos.

## Funcionalidades del track

Siete funcionalidades al mismo nivel. La principal es la 1.

### 1. Cuadrícula de posiciones por tema (PRINCIPAL)

Funcionalidad principal. Vive en el apartado Temas, junto a las tarjetas de cada tema.

- Filas: temas.
- Columnas: partidos o grupos, en orden alfabético.
- Cada celda resume en texto cuál es la posición del partido sobre ese tema.
- Fuentes de cada celda:
  - Las votaciones del tema: la posición de cada partido es el sentido mayoritario de sus diputados (ver regla de posición más abajo).
  - Las declaraciones en el Congreso de diputados de ese grupo sobre el tema.
- Es la pieza central del servicio: responde a "qué ha hecho cada partido sobre lo que me importa".

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

### 5. Coherencia promesas–votos

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
- Posición de un partido en una votación: sentido mayoritario de sus diputados. Un diputado que vote distinto al resto no cambia la posición del grupo. Se muestra el porcentaje de la mayoría (normalmente 99% o 100%).
- Resultado por partido: número y porcentaje de votaciones marcadas en las que el usuario coincide con la posición mayoritaria del partido, sobre el total de votaciones marcadas.
- Cada coincidencia y cada discrepancia enlaza a la votación de referencia (ficha de Reforma Digital con el voto de cada diputado).
- Reglas: sin ganador, sin ranking entre partidos, sin "tu partido es…", sin afinidad general. El resultado solo vale para el conjunto de votaciones elegido.
- El voto del usuario se calcula en el navegador y no se guarda.
- Pendiente: si se mantienen pesos por tema (solo tendrían sentido dentro de un conjunto acotado); qué hacer con votaciones de procedimiento o sin posición mayoritaria clara; cómo mostrar abstenciones del usuario frente a la posición del partido.

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

- Ninguna. Solo se leen datos públicos ya publicados por Reforma Digital.
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

Campos y reglas útiles:

- Temas: campo `tm` en votaciones, leyes e intervenciones. Son 21 temas por palabras clave (vivienda, sanidad, educación, pensiones, empleo, impuestos, energía, clima, campo, igualdad, inmigración, seguridad, justicia, defensa, política exterior, territorio, transporte, cultura, derechos sociales, tecnología, democracia). La web muestra 9; el código tiene 21. Usar `tm` directamente, sin clasificar de nuevo.
- Tono de las intervenciones: lo genera una IA (`ia.provider`, `ia.model`). No hay lista cerrada en el código. Mostrar siempre que es un análisis automático y no verificado.
- Encuestas: el endpoint responde 451 durante la veda. No las usamos.
- Caché: la API responde con cabeceras de caché de 5 a 60 segundos según la ruta.

### Origen de los datos (decisión pendiente)

- A. Fetch en build (Server Components). Datos frescos, pero si la API cae el build falla y no se publica.
- B. Snapshot JSON en `src/datos/`, con script de refresco. Build estable, datos con fecha. Recomendado.
- C. Fetch en cliente. Sin dependencia en build, pero más carga y dependencia en tiempo de uso.
- Antes de decidir: medir el tamaño de los conjuntos que se necesiten.

### Atribución y fuentes

- Escaño Abierto: CC BY 4.0. Reforma Digital: MIT. Citar ambos en cada página que use los datos.
- Cada respuesta lleva `<Fuentes />` con enlace a la votación o sesión concreta (congreso.es o ficha de Reforma Digital).
- `ficha.json`: `datos` pasa de `simulados` a `reales`. Actualizar `fuentes` con Reforma Digital, Escaño Abierto y congreso.es.
- Aviso «Herramienta experimental. No es un servicio oficial.» y botón «¿Algo está mal? Avísanos» en todas las páginas.

### Límites conocidos

- La API en vivo no se ha podido probar desde la sesión de desarrollo (bloqueo de red). Confirmar rutas y tamaños antes de implementar.
- Los datos de promesas (`promesas.py`) no son descargables todavía. Confirmar.
- Track: todo lo anterior vale solo si el alcance pasa la revisión de la organización (ver sección de features 5 y 7).
