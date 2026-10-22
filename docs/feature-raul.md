# Feature · Posturas por medida y promesa ↔ voto (rama `raul`)

Documento de visión de la feature construida en la rama `raul`, para ponerla en común con las del
resto del equipo. Describe qué intentamos mostrar, cómo interactúa el usuario, qué controles
necesita la interfaz, qué aporta y en qué estado está. Fecha: 22 de octubre de 2026.

## 1. Qué intentamos mostrar

Una persona indecisa entra, elige los temas que le importan y en diez minutos sabe **qué ha hecho
cada partido** en esos temas durante la XV legislatura (agosto de 2023 – octubre de 2026) y **si
coincide con lo que prometió** en su programa de 2023. Todo respaldado: cada postura despliega las
votaciones que la sostienen (enlace a congreso.es) y cada promesa es una cita literal con su página
del programa, servido desde nuestra propia web.

La idea central es cambiar la unidad de lectura. Hay 2.185 votaciones y leerlas una a una es
inviable; además, contar «a favor / en contra» engaña: votar contra la ley de ocupación del PP y a
favor de la ley de vivienda del Gobierno es la *misma* postura. Por eso la web no muestra
votaciones sino **medidas** («Regular los precios del alquiler») y, para cada medida, la postura de
cada grupo.

## 2. Qué le aportamos al usuario

| Pregunta del ciudadano | Respuesta de la web |
|---|---|
| ¿Qué piensa cada partido de lo que me importa? | Mapa de posturas: medida × partido, con icono y palabra |
| ¿En qué se basa eso? | Bajo cada medida, las iniciativas votadas y el voto de cada grupo, con enlace oficial |
| ¿Hacen lo que prometieron? | Fila «Programa 2023» bajo cada medida: *Vota como prometió / Vota distinto / Prometió, sin votación clara / Sin promesa / Programa no analizado*, con la cita literal y la página |
| ¿Qué ha defendido cada partido, en sus palabras? | Tarjeta por grupo: a favor de qué, en contra de qué, en qué se abstuvo, y qué dijo en la tribuna (citas del Diario de Sesiones) |
| ¿Puedo comprobarlo yo? | Sí: ficha de cada votación, copia de cada programa, página de Método |

Lo que **no** hace: no recomienda voto, no calcula afinidad ni porcentajes de cumplimiento, no
ordena partidos. El veredicto lo pone el lector.

## 3. Cómo interactúa el usuario (recorrido)

1. **Portada.** «Elige los temas que te importan»: casillas con los 21 temas, botón «Ver qué ha
   hecho cada grupo». Debajo, la rejilla de temas para entrar directo a uno.
2. **Comparar** (`/comparar?temas=vivienda,sanidad`). Un mapa de posturas compacto por tema
   elegido, y debajo un bloque por grupo, plegado. Enlace «Cambiar temas».
3. **Tema** (`/tema/vivienda`). Tres niveles de profundidad, de arriba abajo:
   - **Posturas**: el mapa completo (medida × 8 grupos, «N votaciones» por celda, fila «Programa
     2023»). Cada medida tiene un desplegable «Ver las votaciones de …» con las iniciativas, el voto
     de cada grupo y «Lo que decía su programa en 2023».
   - **Por grupo**: una tarjeta plegada por grupo con una frase factual por cuestión, las listas *A
     favor de / En contra de / Se abstuvo en* (iniciativas con proponente y fecha) y «Lo que
     defendió en el pleno».
   - **Por cuestión**: tablas de conteo y lista de votaciones, para quien quiera verificar.
4. **Votación** (`/votacion/34-3`). Qué se votó (texto oficial), resultado, voto de cada grupo con
   sus diputados, lo que dijo cada grupo en el debate, enlace oficial.
5. **Programas** (`/programas`). Los nueve programas de 2023: fuente original y nuestra copia (PDF).
6. **Método** (`/metodo`). Cómo se calcula cada cosa, qué es automático y qué está revisado.

Todo funciona sin JavaScript: los desplegables son `<details>` nativos y el selector de temas es un
formulario GET.

## 4. Controles que necesita la interfaz

| Control | Dónde | Qué hace |
|---|---|---|
| Casillas de temas + botón «Ver qué ha hecho cada grupo» | Portada, `/comparar` vacío | Lleva a `/comparar?temas=…` (máximo 5 temas) |
| Navegación interna «Posturas · Por grupo · Por cuestión» | Tema | Anclas a los tres niveles |
| Desplegable por medida «Ver las votaciones de «…»» | Mapa de posturas | Abre las pruebas: iniciativas, votos, promesas |
| Desplegable por grupo (tarjeta) | Tema, `/comparar` | Abre el detalle del grupo; todos cerrados por defecto |
| «Ver las N restantes» | Listas de iniciativas | Muestra el resto de la lista |
| Enlace a la votación oficial | Ficha de votación y cada iniciativa | congreso.es |
| «Ver en nuestra copia (pág. N)» y «fuente original» | Cada promesa | Abre el PDF del programa en la página citada |
| «Cómo se calcula» | Mapa | Lleva a `/metodo#posturas` |
| «Cambiar temas» | `/comparar` | Vuelve al selector |
| «¿Algo está mal? Avísanos» | Pie | Obligatorio por la plataforma |

Pendientes de decidir: filtros en el mapa (por proponente, por fecha), buscador de iniciativas por
palabra, compartir una vista como imagen, «Explícame esta votación» con IA en vivo.

## 5. Las capas de datos (todo precalculado, sin IA en tiempo de petición)

1. **Votaciones** (`data/`, Escaño Abierto): 2.185 votaciones con el voto de cada grupo, texto
   oficial, motivos del debate y enlace oficial. Capa tipada: `src/lib/datos.ts` (de Dani).
2. **Cuestiones** (`src/lib/cuestiones.ts`, `src/datos/cuestiones.json`): reglas de palabras clave
   que agrupan las votaciones de un tema en 4–7 cuestiones. Sin IA.
3. **Iniciativas** (`src/lib/iniciativas.ts`): las votaciones de un mismo expediente se agrupan en
   una iniciativa con su proponente (vivienda: 86 votaciones → 29 iniciativas). Da las listas por
   grupo y una frase factual por cuestión («En las 10 votaciones sobre desahucios votó a favor en
   3 y en contra en 7; a favor de iniciativas del Gobierno y en contra de las del Grupo Popular»).
4. **Medidas con dirección** (`src/lib/posturas.ts`, `src/datos/posturas/<tema>.json`): cada tema
   tiene 4–7 medidas; cada iniciativa se asigna a una con lo que significa votar sí (+1/−1). La
   postura de un grupo sale de sus votos: *A favor · En contra · Mixta · Según el punto · Se abstuvo
   · Sin votaciones*. `scripts/posturas.ts` propone la asignación con HelmCode; se revisa a mano.
5. **Lo defendido en el pleno** (`src/lib/propuestas.ts`): líneas que cada grupo pidió en la
   tribuna, con cita, orador, fecha y Diario de Sesiones (resumen automático del origen, marcado).
6. **Promesas de 2023** (`scripts/promesas.ts`, `src/lib/promesas.ts`): port a Bun del pipeline
   `promesas.py` de Reforma Digital, con los mismos prompts e ids. Texto por página de los nueve
   programas (`src/datos/programas/2023/`), extracción de promesas con cita literal y página, y
   juicio promesa ↔ iniciativa (*cumple / avanza / contradice / relacionada / no relacionada*).
7. **Promesa ↔ medida** (`src/lib/promesas-posturas.ts`, `src/datos/promesas-posturas/<tema>.json`):
   cada promesa se asigna a una medida con su postura (a favor / en contra). La etiqueta final es
   una **regla**, no un juicio del modelo: postura prometida frente a postura votada.

## 6. Componentes listos para integrar

- `MapaPosturas` (`src/components/mapa-posturas.tsx`): tabla medida × grupo con fila «Programa
  2023» y desplegable de pruebas por medida; modo `compacto` para `/comparar`; en móvil, una
  tarjeta por medida.
- `TarjetaPartido` (`src/components/tarjeta-partido.tsx`): tarjeta por grupo y tema, plegable y
  compacta.
- `FormularioTemas` (`src/components/formulario-temas.tsx`): el selector de temas.
- `VoteMark` (`src/components/vote-mark.tsx`): las formas de voto (● ■ ◐ ○ –).
- Contratos de datos: `posturasDeTema(slug)`, `cumplimientoPorFila(fila, tema)`,
  `iniciativasDeTema(slug)`, `apoyoPorPartido(iniciativas)`, `fraseApoyo(codigo, cuestion)`,
  `propuestasDeTema(slug)`, `promesasDeTema(slug)`.

## 7. Reglas de presentación

- Grupos siempre en **orden alfabético** y con el **mismo componente**. Sin colores de partido
  (DESIGN.md): el significado va por **forma + palabra**.
- Todo **plegado por defecto** y todos iguales. Una página de tema cabe en 3–5 pantallas.
- **Ninguna cifra sin su prueba** a un clic: votación oficial o página del programa.
- Lo generado por IA se **marca** («resumen automático», «asignación automática, pendiente de
  revisión»). Las etiquetas de cumplimiento son reglas, no texto del modelo.
- Sol: serif solo en titulares y cifras grandes, una acción principal por pantalla, sin
  degradados, sin scroll horizontal a 320 px, AA.

## 8. Cómo extender a otro tema

```
bun scripts/posturas.ts <tema>            # propone src/datos/posturas/<tema>.propuesto.json
# revisar a mano y renombrar a <tema>.json
bun scripts/promesas.ts promesas <SIGLA> <tema> --limite 10
bun scripts/promesas.ts juicio <SIGLA> <tema> --limite 10
bun scripts/promesas-posturas.ts          # promesa → medida a partir de los juicios
```

Necesita `HELMCODE_API_KEY` y `HELMCODE_MODEL` en `.env.local`. Las llamadas son secuenciales y
con límite para respetar la cuota compartida.

## 9. Estado y lo que falta

- **Hecho y verificado** (build, 109 tests, sin desbordes a 320/360/1440): portada con selector,
  `/comparar`, tema con tres niveles, ficha de votación, `/programas`, Método; mapa de posturas y
  fila «Programa 2023» en **vivienda**, revisado a mano; pipeline de promesas funcionando.
- **En marcha**: promesas de vivienda de los ocho programas; posturas de sanidad, inmigración,
  pensiones y educación (propuestas por IA, revisadas por un agente).
- **Siguiente**: posturas automáticas de los 16 temas restantes (marcadas como no revisadas),
  promesas de los programas completos, resumen en cuatro frases por partido y tema, página por
  partido («El PP en estos cuatro años»).
- **Límites conocidos**: 56 de las 86 votaciones de vivienda son puntos de mociones con título
  común, por lo que su medida se deduce de los debates; los partidos de 2026 no son los de 2023
  (Sumar es hoy Frente Abierto; el Grupo Mixto no es un partido); los programas de ERC y Junts
  están en catalán.
- **Riesgo asumido**: la comparación con programas y las etiquetas «vota como prometió / vota
  distinto» salen del alcance que fija `SETUP.md` («nada que oriente el voto, ni resúmenes de
  programas»). Está registrado en `docs/DECISIONS.md` (entrada de las 20:33).
