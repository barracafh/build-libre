# Handoff: posición de cada partido por tema

- Preparado: 2026-10-22 19:11 +02:00
- Transferencia: PREPARED — `docs/` del repo, para quien siga con datos o con la vista por tema
- Tarea: UNRESOLVED — hay estudio de datos y un borrador HTML; falta llevarlo a `src/` y a la web

## Objetivo y criterios de aceptación

Objetivo de la app (ver [AGENTS.md](../AGENTS.md) y la decisión «Posición del partido por tema» en
[DECISIONS.md](DECISIONS.md)): para una lista fija de temas, mostrar cómo votó cada partido en el
Pleno de la XV legislatura, con cada dato enlazado a su fuente oficial. La posición es la lista de
votos; sin etiqueta resumen. Cualquier cifra es un recuento.

Siguiente foco: llevar a la web la vista por tema con tres visualizaciones, empezando por Vivienda.

Hecho cuando:

- `src/lib/datos.ts` expone `tema(slug)` con iniciativas agrupadas (ver «Forma de los datos»), con test.
- Existe `/tema/[slug]/` (export estático) con: matriz iniciativa × grupo, ficha de grupo con
  recuentos por tipo y por proponente, y tiras temporales; cada voto enlaza congreso.es.
- Cumple `DESIGN.md` (marcas de voto por forma + texto, grises neutros, sin colores de partido) y
  las reglas de neutralidad de `AGENTS.md`; se ve bien a 360 px.
- Pasan `bun run typecheck`, `bun run test` y `bun run build`.

## Estado de trabajo exacto

- Repositorio: `/home/davertor/git_projects/build-libre`
- Git: rama `dani/datos-web`, HEAD `df10563935cd02f8e4ed740227d327480cc09a6e`, 1 commit por
  delante de `origin/dani/datos-web` (sin push).
- Orca: no aplica.
- Cambios locales sin commit, ambos del autor, no tocar sin preguntar:
  - `AGENTS.md`: nuevo objetivo de la app y «push por HTTPS».
  - `docs/DECISIONS.md`: entradas «Posición del partido por tema» y «Lista fija de temas».
- Sin commit: este archivo.
- Runtime: ninguno en marcha.

## Lo que sabemos de los datos

Fuente: instantánea de Escaño Abierto en `data/` (commit fijado en `data/source.json`), leída en
build por `src/lib/datos.ts`. Campos y enlaces entre ficheros: [data/README.md](../data/README.md).

Cifras de esta instantánea (medidas el 22 oct con `src/lib/datos.ts`):

| Dato | Valor |
| --- | --- |
| Votaciones del Pleno | 2.185 (2023-09-19 a 2026-10-02) |
| Con `exp` (expediente) | 2.050, en 603 expedientes; 215 expedientes con más de 1 votación |
| Iniciativas si se agrupa por `exp` (o id si no hay) | 738 |
| Votaciones de enmiendas (título «(enmienda…» / «(resto de…») | 577 |
| Iniciativas votadas solo por puntos «(punto N)» | 145 |
| Votaciones sin tema (`tm` vacío) | 495 (23 %) |
| Votaciones con algún motivo (`porque`) | 1.807; 7.185 motivos |
| Iniciativas multi-voto donde algún grupo votó distinto entre puntos | 187 de 214 |

Lo que ya hace `src/lib/datos.ts` (reglas en su cabecera): posición por grupo con la regla del
80 % (`S/N/A/D/X`), recuento por grupo, fuera Mixto/Gobierno/Mesa, nombres de
`src/config/partidos.json`, orden alfabético, motivos separados como texto de IA.

Temas: lista fija de 18 en `TEMAS` (commit `df10563`), todos etiquetas `tm` de upstream asignadas
por palabras clave sin IA. `defensa` se une a `exteriores`; `cultura` y `tecnologia` fuera.
Corrupción y Dependencia se descartaron porque exigirían palabras clave propias.

Problemas de limpieza encontrados (no resueltos en `src/` todavía):

1. Una ley inunda el tema: Movilidad Sostenible (`121/000009`) tiene 141 votaciones. Agrupar por `exp`.
2. Enmiendas parecen la ley: separar votaciones principales de enmiendas (regex
   `/\((resto de (las )?)?enmienda/i`); mostrar enmiendas plegadas.
3. Votaciones sin `exp` del mismo punto del orden del día cuentan como iniciativas distintas
   (p. ej. `132-16…19`, `180-7…11`). Agrupar por `exp ?? fecha + texto oficial`.
4. Temas incoherentes dentro de un `exp` (15 casos) y `121/000004` (desperdicio alimentario, 100
   votaciones) sin tema. Propuesta: la iniciativa toma la unión de temas de sus votaciones.
5. Motivos con cobertura desigual (Junts 191/731 iniciativas, SUMAR 418/731) y ausentes en
   votaciones recientes (mayo 2026). Mostrar «Sin intervención registrada» igual para todos.

Enlace votación → sesión: `sesiones/*.json` → `puntos[].votos` contiene ids de votación; la sesión
da `ds` (PDF del Diario). Todas las votaciones aparecen en algún punto.

## Neutralidad: qué se acordó

- No caracterizar la posición de un partido ni sumar Sí/No del tema entre iniciativas: mezcla
  propuestas de sentido opuesto y equivale a una etiqueta.
- Sí: matriz por iniciativa (el sentido de la fila es el mismo para todos); recuentos sobre campos
  oficiales (tipo de iniciativa, quién la propone); lo que el partido propuso; motivos etiquetados
  como IA con enlace al Diario.
- Nunca: porcentaje de coincidencia entre partidos, ordenar por cifras, colores de partido (no
  aprobados por la organización, ver `DESIGN.md`).

## Forma de los datos propuesta

```text
Tema (slug, nombre, recuento {iniciativas, votaciones})
└─ Iniciativa[]   más reciente primero
   ├─ clave (exp o id), tipo, titulo, texto, proponente, fecha
   ├─ votaciones[]   principales; por grupo S/N/A/D/X + conteo + fuente congreso.es
   ├─ enmiendas      { total, ids }
   ├─ sesiones[]     { id, fecha, organo, diario }
   └─ motivos        por grupo, texto IA + orador + Diario
```

## Investigación hasta ahora

| Intento o hipótesis | Observación / evidencia | Conclusión |
| --- | --- | --- |
| Agrupar por `exp` | 2.185 → 738 iniciativas | Mantener |
| Agrupar sin `exp` por fecha + texto | Vivienda: 29 iniciativas, 86 votaciones principales | Mantener; falta pasarlo a `src/` |
| Elegir una «votación principal» por iniciativa | 145 iniciativas solo por puntos, 111 con varias no-enmienda | Descartado: mostrar todas las principales |
| Resumen manual de la posición en Vivienda | Hecho en conversación; patrones claros | No publicable (regla de neutralidad); útil solo para validar datos |
| Lectura de Vivienda | Bloques estables: EH Bildu/Frente Abierto/ERC vs PP/VOX; PSOE, PNV, Junts varían por iniciativa | Hecho, interpretación propia |

## Resultados verificados y artefactos

| Comando y cwd | Revisión y hora | Resultado | Artefacto |
| --- | --- | --- | --- |
| `bun run test` en el repo | `df10563`, sucio (AGENTS.md, DECISIONS.md); 2026-10-22 ~18:52 +02:00 | 12/12 pasan | — |
| `bun run typecheck` | igual | sin errores | — |
| `bun run lint` | igual | falla: `error: Script not found "lint"` | — |
| Borrador HTML de Vivienda | 2026-10-22 ~19:05 +02:00 | publicado; solo comprobado que el script parsea, no visto renderizado | https://claude.ai/code/artifact/7653c333-0312-4b41-abce-5eaf498c381c (privado, hay que compartirlo) |
| Informe de estudio de datos | 2026-10-22 | publicado | https://claude.ai/code/artifact/7df7a59e-c0e3-4866-af01-3f8d69bdbca6 (privado) |

- No ejecutado: `bun run build`, revisión a 360 px del borrador.
- Scripts del borrador (`gen.ts`, `plantilla.html`) están solo en el temporal de la sesión de
  Claude Code de Dani, no en el repo: rehacer la agrupación en `src/lib/datos.ts`.

## Siguiente experimento

- Hipótesis: `tema("vivienda")` en `src/lib/datos.ts` reproduce las 29 iniciativas y 86
  votaciones principales del borrador.
- Acción: implementar `tema(slug)` con las reglas 1–4 de arriba; test en `src/lib/datos.test.ts`
  que compruebe: Movilidad Sostenible = 1 iniciativa con enmiendas aparte; `132-16…19` en una
  iniciativa; Vivienda = 29 iniciativas; cada votación con tema aparece en su tema. `bun run test`.
- Interpretar: si las cifras difieren, revisar la clave de agrupación sin `exp`; si cuadran, pasar
  a la página `/tema/[slug]/`.
- Bloqueo: ninguno.

## Restricciones y skills sugeridos

- Autorización: ramas propias desde `dev`, commits pequeños; nada a `main` sin los checks de
  `AGENTS.md`. Avisar antes de tocar `package.json`, `bun.lock` o `ficha.json`.
- Preservar: los cambios sin commit de `AGENTS.md` y `docs/DECISIONS.md`. No reabrir etiqueta
  resumen por tema ni temas con palabras clave propias sin nueva decisión.
- Pendiente de decidir: votaciones sin tema (propuesta: fuera de las vistas, recuento en
  `/metodo/`); si se muestra algo de las sesiones aparte del enlace al Diario.
- Skills: `flow-feature` (implementar `tema()` y la página), `flow-frontend` (vistas, 360 px),
  `dataviz` (marcas y tooltips), `verification-before-completion`.

## Agente que recibe: empieza aquí

1. Verifica checkout, rama, HEAD, cambios locales y acceso a los artefactos contra este brief.
   Para y concilia diferencias antes de editar; no sobrescribas trabajo local.
2. Lee la evidencia enlazada y reproduce cuando sea seguro y esté autorizado, o informa del
   bloqueo. Los resultados anteriores son históricos: revalida.
3. Empieza por el siguiente experimento. Revisa enfoques descartados solo con evidencia nueva y
   explica cualquier cambio de rumbo. Sigue las instrucciones y permisos actuales del proyecto.
4. En un handoff completo, toma la propiedad sin ediciones simultáneas del emisor. La entrega no
   resuelve la tarea: verifica los criterios de aceptación antes de darla por hecha.
