# Arquitectura: Track libre (cómo votó cada partido)

Estado: el repo es la plantilla del evento más el alcance del track. Las secciones marcadas **(planificado)** no existen todavía. Las reglas de producto están en `context/pre-development.md` y `context/proposal.md`; las reglas de la plataforma, en `AGENTS.md`.

## 1. Stack

| Capa | Tecnología | Versión | Rol |
|---|---|---|---|
| Runtime y gestor | Bun | según `bun.lock` | Instalar dependencias (`bun install --frozen-lockfile`), ejecutar el script de volcado y los tests |
| Runtime servidor | Node.js | ≥ 22 | Ejecución de Next.js en build y en servidor |
| Framework | Next.js 16.4 (App Router) | 16.4.0 | Páginas, Server Components por defecto, Route Handlers en `src/app/api/`, build estático |
| UI | React | 19.3.0 | Componentes. Client Components solo para cuadrícula, filtros, comparador y calculadora |
| Lenguaje | TypeScript | 5.9.3 | Tipado de todo el código y de los esquemas del volcado |
| Estilos | Tailwind CSS | 4.3.3 | Clases de composición. Tokens fijos en `src/styles/tema.css` |
| Componentes | shadcn/ui con Base UI (`@base-ui/react`) | 1.8.0 | Primitivas en `src/components/ui/` (`Button`, `Card`, `Badge`, `Input`, `Textarea`), copiadas de Reforma Digital |
| Iconos | lucide-react | 1.59.0 | Icono de cada voto (a favor, en contra, abstención), junto al texto |
| Utilidades | class-variance-authority, cn | 0.7.1 / 0.4.0 | Variantes de componentes |
| Datos | JSON versionado | — | Volcado de Reforma Digital en `src/datos/`, generado por script |
| Generación de datos **(planificado)** | Script TypeScript con Bun | — | Descarga la API de Reforma Digital, valida contra sus esquemas y escribe `src/datos/` con fecha |
| Tests **(planificado)** | Por definir (Bun test o equivalente) | — | Tests de las funciones de cálculo en `src/lib/` |
| Búsqueda **(planificado)** | Pagefind | — | Búsqueda estática sin servidor, si entra en el alcance |
| Gráficos **(planificado)** | CSS o Observable Plot | — | Sin librerías pesadas |
| Hosting | Plataforma BARRACA (`build.barraca.house/libre`), config en `vercel.json` | — | Cada push a `main` despliega si `bun run build` pasa |
| Analítica | Ninguna | — | Sin cookies, sin seguimiento |

## 2. Fronteras del sistema

Qué carpeta es responsable de qué. Regla: el código de producto solo toca carpetas marcadas como **propias**.

| Ruta | Responsabilidad | Quién la edita |
|---|---|---|
| `src/app/` | Rutas (App Router): página principal, páginas de tema, de votación y de sesión. `layout.tsx` y `globals.css` | Propia |
| `src/app/api/` | Route Handlers. En el alcance del track no hay rutas de datos: todo se sirve desde `src/datos/`. La ruta `ia/` es el ejemplo de la plantilla | Propia (la ruta `ia/` se elimina si no se usa) |
| `src/lib/` | Funciones puras de cálculo: posición con umbral del 80 %, mayoría, división, alineamiento, filtro de Pleno. Y `ia.ts` (cliente HelmCode de la plantilla) | Propia. Las funciones de cálculo no dependen de React ni de red |
| `src/datos/` | Volcado JSON generado: votaciones, sesiones, intervenciones, índice de diputados y grupos, fecha de generación | Generada por el script. No se edita a mano |
| `scripts/` **(planificado, ubicación por confirmar)** | Script TypeScript con Bun que genera `src/datos/` | Propia |
| `src/components/` | Componentes de producto: cuadrícula, tarjetas, vista de cruce, comparador, calculadora, `Fuentes.tsx`, `BotonAviso.tsx` | Propia |
| `src/components/ui/` | Primitivas shadcn/ui copiadas de Reforma Digital (`packages/design/ui/`). Origen y licencia en `AVISO.md` | Solo añadir componentes con `bunx shadcn@4.22.1 add`. Nunca sobrescribir |
| `src/config/sitio.ts` | `ruta()` (prefijo de `basePath` para `fetch` e imágenes) y `feedbackUrl` | Solo lo que ya trae la plantilla |
| `src/styles/tema.css` | Tokens de diseño | No se toca: no cambiar valores ni añadir colores, fuentes, radios o sombras |
| `ficha.json` | Nombre, frase, icono, `equipo` (`libre`), URL, fuentes y `datos` (`simulados` → `reales`) | Propia en sus campos de contenido. `equipo` no se cambia |
| `next.config.ts` | `basePath` = `/${ficha.equipo}` | No se toca |
| `vercel.json` | Comandos de instalación y build | No se toca |
| `context/` | Documentación del equipo: `pre-development.md`, `proposal.md`, `project-overview.md`, `architecture.md` | Propia |
| `datos/` | Material de la organización (catálogos y dominios de otros tracks) | **No editar** |
| `comun/` | Material de la organización (territorio, competencias) | **No editar** |
| `contexto.md`, `SETUP.md`, `AVISO.md` | Material de la organización | **No editar** |
| `.buildnight/plantilla.json` | Plantilla del evento | **No editar** |

## 3. Modelo de almacenamiento

| Qué | Dónde | Formato | Quién escribe | Quién lee | Notas |
|---|---|---|---|---|---|
| Datos de votaciones, sesiones, intervenciones | `src/datos/` (repo) | JSON versionado, un fichero por mes o por conjunto | Script Bun (manual) | Server Components en build | Fecha de generación visible en la interfaz. Primera generación congelada para el hackatón |
| Índice de diputados y grupos | `src/datos/` (repo) | JSON | Script Bun | Cuadrícula, filtros de diputados | Grupo Mixto excluido de la cuadrícula |
| Votos clave por tema, explicados en lenguaje claro **(planificado)** | YAML en el repo | YAML revisable por PR | Equipo, por PR | Build | Cada cambio queda en un PR con su autor |
| Voto del usuario (calculadora) | Memoria del navegador (estado de React) | — | Usuario, en la interfaz | Calculadora | Se pierde al recargar. **No** se guarda en servidor, `localStorage`, cookies ni logs |
| Texto que escribe el ciudadano | Ninguno | — | — | — | Ninguna base de datos ni log con su texto (regla 3 de la plataforma) |
| Base de datos | **Ninguna** | — | — | — | No hay uso definido. Solo se permitiría si algo lo necesita sin violar la regla 3 |
| Caché servidor | **Ninguna** | — | — | — | Todo es estático en build. No hay llamadas en tiempo de uso |
| Caché del navegador | Cabeceras del hosting para estáticos | — | Plataforma | Navegador | No se gestiona desde la aplicación |
| Credenciales | Variables de entorno (`.env.local` en local; puestas en el proyecto de Vercel en publicado) | — | Equipo | Solo servidor | Nunca en el repo ni con prefijo `NEXT_PUBLIC_` |

## 4. Acceso y autenticación

| Aspecto | Modelo |
|---|---|
| Autenticación | Ninguna. Sin cuentas, sin login, sin sesiones |
| Autorización | Ninguna necesaria: todo el contenido es público de lectura |
| Ownership | No existe: la aplicación no crea ni modifica registros de usuario |
| Datos del usuario | No se almacenan. La calculadora vive en memoria del navegador |
| Datos de terceros | Datos públicos de Reforma Digital (MIT) y Escaño Abierto (CC BY 4.0), copiados en el repo y atribuidos en cada página |
| Acceso a la API de Reforma Digital | Solo lo usa el script de volcado, fuera de la aplicación. Endpoints públicos de lectura, sin clave |
| Claves de IA | Solo en servidor, en variables de entorno. Hoy la aplicación no las usa en tiempo de uso |
| Feedback | Botón «¿Algo está mal? Avísanos» enlaza a `feedbackUrl` (issues del repo). No recibe datos del usuario desde la aplicación |

## 5. Modelo de IA y tareas en segundo plano

### IA

| Punto | Estado | Detalle |
|---|---|---|
| Uso en tiempo de ejecución de la aplicación | **No se usa** | Las respuestas son los datos del volcado |
| Cliente de IA | `src/lib/ia.ts` (plantilla) | Función `completar()` contra la API compatible con OpenAI de HelmCode. Modelo `glm5.3-flash`. Reintenta hasta 3 veces ante 429, con espera de `retry-after` o potencia de 2, máximo 10 s |
| Ruta de ejemplo | `src/app/api/ia/route.ts` (plantilla) | Solo ejemplo: se elimina si no hay uso |
| IA en los datos de origen | Ya aplicada en el pipeline de Reforma Digital | Selección de citas por IA; tono de intervenciones generado por IA (`ia.provider`, `ia.model`). Ambos se muestran como análisis automático y no verificado |
| Verificación de citas | Ya aplicada en el pipeline de Reforma Digital (`cita_verificada`) | Solo se muestra una cita si aparece literalmente en el Diario de Sesiones |

### Tareas en segundo plano

| Tarea | Estado | Cuándo corre | Qué hace | Salida |
|---|---|---|---|---|
| Generación del volcado | **Planificado** (script manual) | A mano, cuando haga falta | Descarga la API de Reforma Digital, valida contra `voteSchema`, `sessionSchema`, `interventionSchema` y `monthSchema`, escribe `src/datos/` con fecha | Ficheros JSON versionados en git |
| Actualización automática | **Fuera del alcance del hackatón** | Pendiente (GitHub Action diaria) | Igual que la anterior, sin intervención humana | Pull request o commit en `main` |
| Build | Vercel, en cada push a `main` | Al publicar | `bun install --frozen-lockfile` y `bun run build` | Página estática. Si falla, no se publica |

## 6. Invariantes

Reglas que el código nunca debe violar. Cada una se puede comprobar con código, tests o revisión.

1. **El build no hace red.** `bun run build` no llama a la API de Reforma Digital ni a ningún otro servicio. Todo dato entra por `src/datos/`. Si el build depende de la red, no se publica.
2. **La aplicación nunca llama en vivo a la API de Reforma Digital.** Ni en build ni en navegador ni en servidor en tiempo de uso.
3. **Lo que escribe el ciudadano no se guarda.** Ni base de datos, ni logs, ni `localStorage`, ni cookies, ni estado en servidor. El voto de la calculadora vive solo en memoria de React.
4. **Ninguna clave de IA ni de servicio llega al navegador.** Las claves van solo en variables de entorno del servidor, nunca con prefijo `NEXT_PUBLIC_`, nunca en el repo.
5. **Cada posición de partido sigue la regla de sentido mayoritario.** Posición = sentido con más votos entre los diputados que votan. Las ausencias no cuentan. Si la mayoría es inferior al 80 %, la celda muestra «dividido (mayoritariamente X)», nunca una posición única. El umbral es el de `votaciones.py` de Reforma Digital, para que las celdas coincidan con su fuente.
6. **Solo se muestra una cita si es literal.** Cada cita debe aparecer exactamente en el Diario de Sesiones. Nunca se inventa, parafrasea ni interpreta. Una intervención sin cita verificada se muestra sin cita.
7. **Ningún dato sin fuente.** Cada respuesta incluye `<Fuentes />` con el enlace a la página concreta (votación, sesión o ficha oficial). Cada página con datos muestra la atribución (Escaño Abierto CC BY 4.0; Reforma Digital MIT).
8. **El aviso y el botón de feedback están en todas las páginas.** «Herramienta experimental. No es un servicio oficial.» y «¿Algo está mal? Avísanos».
9. **Ningún listado de partidos se ordena por resultado.** Siempre alfabético. Prohibido: ranking, podio, «tu partido es…», porcentaje de afinidad general, o recomendación de voto.
10. **Las funciones de cálculo son puras.** Las funciones de `src/lib/` no leen red, disco ni estado de React. Reciben datos y devuelven resultados, y tienen tests.
11. **Los datos del volcado se validan antes de escribirse.** El script rechaza cualquier registro que no cumpla los esquemas de Reforma Digital. Un fallo de validación deja la versión anterior de `src/datos/`.
12. **La fecha del volcado se muestra en la interfaz.** Ningún dato aparece sin saber cuándo se generó.
13. **Alcance de datos.** Solo legislatura XV. Solo Pleno en los datos actuales. Grupo Mixto fuera de la cuadrícula y de la calculadora. Sin datos de encuestas.
14. **Los materiales de la organización no se editan.** `datos/`, `comun/`, `contexto.md`, `SETUP.md`, `AVISO.md` y `.buildnight/plantilla.json` no se modifican. Los datos propios van en `src/datos/`.
15. **Diseño fijo.** No se cambian valores de `src/styles/tema.css`. No se añaden colores, fuentes, radios ni sombras. Los votos siempre llevan icono y texto, nunca solo color. Sin scroll horizontal a 320 px.
16. **Identidad de ruta.** `ficha.json` → `equipo` = `libre` define `basePath` y la URL. No se cambia. Todo `fetch` y toda imagen de `public/` usan `ruta()`.
17. **Publicar solo con build verde.** `bun run build` debe pasar antes de cada push a `main`. Trabajar en `main` con `git pull --rebase` antes de cada push.
18. **Sin logotipos ni nombre de Reforma Digital ni de la Administración** en la interfaz. La herramienta se presenta con el icono y nombre de `ficha.json`.
