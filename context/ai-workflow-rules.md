# Reglas de trabajo para el agente de IA: Track libre

Estas son reglas. Cúmplelas en cada sesión, sin excepción. Si una regla choca con una petición del usuario, para y pregunta antes de actuar.

Orden de lectura al empezar cualquier sesión:

1. `context/project-overview.md`
2. `context/architecture.md`
3. `context/pre-development.md` (decisiones tomadas y preguntas abiertas)
4. `context/progress-tracker.md`
5. `AGENTS.md` (reglas de la plataforma)
6. El spec de la unidad en curso, en `context/specs/NN-nombre.md`

## 1. Enfoque

1. Trabaja con especificaciones. Antes de escribir código, existe un spec en `context/specs/` para esa unidad. Si no existe, escríbelo primero y pide confirmación.
2. Trabaja de forma incremental. Cada unidad produce un resultado visible y verificable.
3. Sigue el orden de `context/specs/00-build-plan.md`. No saltes unidades. No empieces una unidad si sus dependencias no están completas en `progress-tracker.md`.
4. Usa como fuente de verdad, en este orden: los spec, `architecture.md`, `project-overview.md`, `pre-development.md`, `AGENTS.md`. Si dos fuentes se contradicen, para y pregunta.
5. Respeta la cadena crítica: contrato del volcado → T1 (datos) → vista de cruce. Las reglas de cálculo (T2) y la interfaz base (T3) pueden avanzar con fixtures que sigan el contrato.

## 2. Alcance

1. Implementa solo lo que dice el spec de la unidad en curso. Nada más.
2. No añadas funciones, campos, rutas, componentes, opciones de configuración ni dependencias «por si acaso».
3. No hagas refactors fuera de la unidad. Si ves algo que mejorar en otra parte, anótalo en `progress-tracker.md` bajo «Open Questions» y sigue.
4. No mezcles en una misma sesión cambios de dos fronteras del sistema (por ejemplo, datos y componentes de interfaz). Si el spec lo requiere, sepáralo en dos commits.
5. No implementes features fuera de alcance: feature 5 (promesas–votos), feature 8 (candidaturas), Grupo Mixto, legislaturas distintas de la XV, encuestas, Comisión, base de datos, cuentas, analítica. Lista completa en `project-overview.md`.
6. No instales ninguna dependencia antes de la unidad que la necesita. Cada spec lista sus dependencias en su sección «Dependencies». Si necesitas algo no listado, para y pregunta.

## 3. Cuándo dividir el trabajo

Divide la unidad en pasos más pequeños cuando ocurra cualquiera de estas condiciones:

1. El spec toca más de una frontera del sistema (ver `architecture.md`, sección 2).
2. El spec tiene más de cinco criterios de verificación.
3. Una parte depende de una decisión que aún no está tomada.
4. El cambio supera unas 300 líneas netas, o toca más de 10 ficheros.
5. Un paso no puede verificarse por sí solo.

Cuando dividas, escribe los sub-pasos en `progress-tracker.md` y completa uno antes de empezar el siguiente.

Divide siempre que tengas que escribir la interfaz y los datos a la vez: primero la interfaz con fixture, luego la conexión al volcado real.

## 4. Requisitos ausentes o ambiguos

1. No inventes requisitos. Nunca completes en silencio un hueco del spec.
2. Si la respuesta está en `pre-development.md`, `project-overview.md` o `architecture.md`, aplícala y cita el fichero y la línea en el commit o en `progress-tracker.md`.
3. Si la respuesta no está en esos ficheros:
   - Si la decisión puede revertirse con poco coste (nombres de componentes, estructura interna de una función), toma la opción más conservadora. Anótala en `progress-tracker.md` bajo «Architecture Decisions» con la fecha.
   - Si la decisión afecta al producto, a los datos mostrados, al umbral del 80 %, a la calculadora, a la atribución, a la privacidad o a la publicación, **para**. Añade la pregunta a «Open Questions» y pregunta al usuario. No implementes ninguna de las opciones.
4. Las preguntas abiertas que hoy existen en `pre-development.md` no se resuelven por tu cuenta. Entre ellas: MVP del jueves, porcentaje global por partido, pesos por tema, estado «alineamiento no definible», tratamiento de Comisión, filtro de intervenciones por `temas` o por sesión, revisión del tono de IA, host de la API, enrutado de `/libre`.
5. Si el spec contradice un invariante de `architecture.md`, el invariante gana. Para y pregunta.
6. No consultes fuentes externas para decidir producto. Sí puedes consultar la documentación de la librería que usas.

## 5. Ficheros que no se modifican sin instrucción explícita

Nunca edites estos ficheros sin una instrucción explícita del usuario para ese fichero concreto:

| Fichero o carpeta | Motivo |
|---|---|
| `src/components/ui/**` | Componentes copiados de Reforma Digital. Se añaden solo con `bunx shadcn@4.22.1 add <componente>`. Nunca uses `--overwrite` ni `shadcn init`. Si el CLI pide sobrescribir, responde **no** |
| `src/styles/tema.css` | Tokens de diseño fijos. No cambies valores ni añadas colores, fuentes, radios o sombras |
| `datos/`, `comun/`, `contexto.md`, `SETUP.md`, `AVISO.md` | Material de la organización |
| `.buildnight/plantilla.json` | Plantilla del evento |
| `ficha.json` campo `equipo` | Define la ruta y el sitio. Los demás campos sí se actualizan según la unidad |
| `next.config.ts` | Define `basePath` |
| `vercel.json` | Comandos de despliegue |
| `package.json` y `bun.lock` | Solo cambian al añadir una dependencia listada en un spec, con `bun add` o `bunx shadcn` |
| `AGENTS.md` | Reglas de la plataforma |
| `.gitignore` | Solo con instrucción explícita |
| Repo de Reforma Digital (`C:\Users\adrik\Projects\reforma-digital`) | Solo lectura. Nunca se modifica desde este proyecto |

Lo que sí puedes editar en cada unidad: `src/app/`, `src/lib/` (excepto `ia.ts` salvo que el spec lo pida), `src/components/` (excepto `ui/`), `src/config/sitio.ts` (solo para `feedbackUrl` si el spec lo pide), `src/datos/` (solo mediante el script), `scripts/` (cuando exista), `context/`.

## 6. Mantén la documentación sincronizada

1. Después de cada cambio significativo, actualiza `context/progress-tracker.md`: fase actual, unidad en curso, unidades completadas, preguntas abiertas, decisiones de arquitectura y notas de sesión.
2. Si la implementación cambia la arquitectura (fronteras, almacenamiento, invariantes, stack), actualiza `context/architecture.md` en el mismo commit.
3. Si la implementación cambia el alcance o los criterios de éxito, actualiza `context/project-overview.md` en el mismo commit y anota el motivo en `progress-tracker.md`.
4. Si cambia una decisión de `pre-development.md`, no la borres: añade la nueva decisión con la fecha y marca la anterior como sustituida.
5. Si cambia una regla de trabajo, actualiza este fichero y dilo en `progress-tracker.md`.
6. Marca como «(planificado)» en `architecture.md` lo que aún no exista, y quita la marca cuando exista.
7. Nunca dejes en la documentación una afirmación que el código no cumple. Si no puedes actualizarla, añade una nota con la discrepancia en «Open Questions».

## 7. Verificación antes de pasar a la siguiente unidad

Ninguna unidad se da por terminada hasta que todos estos puntos se cumplan. Ejecuta los comandos y lee su salida. No des por bueno un paso sin ejecutarlo.

1. [ ] Cada criterio de «Verify when done» del spec está comprobado, uno por uno, con evidencia (comando, captura o prueba).
2. [ ] `bun run typecheck` pasa sin errores.
3. [ ] `bun run build` pasa sin errores. El build no hace llamadas de red.
4. [ ] Los tests de `src/lib/` pasan, si la unidad toca reglas de cálculo.
5. [ ] Ningún cambio fuera de las carpetas permitidas de la sección 5.
6. [ ] Ninguna dependencia nueva que no esté en el spec.
7. [ ] Cada respuesta o página con datos incluye `<Fuentes />` con enlace a la página concreta.
8. [ ] El aviso «Herramienta experimental. No es un servicio oficial.» y el botón «¿Algo está mal? Avísanos» siguen presentes.
9. [ ] Ningún partido aparece ordenado por resultado. El orden es alfabético.
10. [ ] Los votos se indican con icono y texto, nunca solo con color.
11. [ ] Contraste AA, foco visible, `prefers-reduced-motion` respetado.
12. [ ] Sin scroll horizontal a 320 px. Revisado en móvil y en escritorio.
13. [ ] Sin errores ni avisos en la consola del navegador.
14. [ ] Ninguna clave en el código ni con prefijo `NEXT_PUBLIC_`.
15. [ ] Ningún dato del ciudadano se escribe en disco, base de datos, `localStorage` ni cookies.
16. [ ] `context/progress-tracker.md` actualizado.
17. [ ] Documentación afectada actualizada (sección 6).
18. [ ] Cambios sincronizados con `main` con `git pull --rebase` antes del push. Push solo si el build pasa.

Si un punto falla, no avances. Corrige solo ese punto y vuelve a verificar. No cambies nada más en la misma corrección.

## 8. Git y publicación

1. Trabaja en `main`, como dice `AGENTS.md`. No crees ramas de vista previa.
2. Haz `git pull --rebase` antes de cada push.
3. Cada push a `main` se publica. No hagas push de código sin verificar la unidad.
4. Haz un commit por unidad o por paso de la división de la sección 3. Mensajes de commit en imperativo y en español, con el identificador de la unidad: `Unidad 03: cuadrícula de posiciones por tema`.
5. No hagas `force push` ni reescribas historia de `main`.

## 9. Cuando te atascas

1. Si el mismo error aparece tres veces seguidas, para. Describe el error y lo que intentaste. Pregunta antes de seguir.
2. Si una corrección rompe algo que antes funcionaba, revierte la corrección y vuelve al estado anterior.
3. Si la verificación falla por causas fuera de la unidad (red, API caída, build de otra parte), para. Anota la causa en `progress-tracker.md` y pregunta.
4. Nunca cambies un test para que pase. Si un test falla, el código está mal o el test está mal según el spec. Decide con el spec delante y, si tienes dudas, pregunta.

## 10. Lo que el agente no decide

- Si la herramienta se publica, ni cuándo.
- Qué candidaturas o promesas se muestran.
- Cualquier texto de cara al ciudadano que no esté en un spec o en `project-overview.md`.
- Cualquier cifra, fecha o requisito que muestre la herramienta.
- Si una cita o un tono generado por IA se publica sin revisión.
