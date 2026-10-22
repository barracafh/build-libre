# Feature 1 · Cuadrícula de posiciones y vista de cruce

Autora: Adri · rama `dev-adri` · estado: funcional en vista de prueba, pendiente de consolidar.

## Qué hace

Muestra, para cada tema del Congreso y cada grupo parlamentario, cómo votó ese grupo en las
votaciones del Pleno de la XV legislatura. Sin ranking, sin recomendaciones, sin calificativos:
recuentos, síntesis generada y enlaces a la fuente oficial.

Hay dos vistas:

1. **Cuadrícula de posiciones** (`/posiciones`). Filas = temas, columnas = grupos, ambos en orden
   alfabético. Cada cruce (celda) muestra:
   - la síntesis de las razones de voto del grupo en ese tema (texto generado por IA, etiquetado como tal);
   - el recuento: «N votaciones: X sí, Y no, Z abstenciones, W divididos».
   Las celdas sin votaciones muestran «Sin votaciones». La celda entera es un enlace.

2. **Vista de cruce** (`/posiciones/test?partido=CODIGO&tema=TEMA`, vista de prueba). Se abre al
   pulsar una celda y muestra de dónde sale esa posición:
   - **Síntesis de las razones del voto**, con aviso de texto generado por modelo de lenguaje.
   - **Votaciones**: una tarjeta por votación del tema con fecha, título, sentido del voto del
     grupo (Sí, No, Abstención, Dividido, con marca e icono además de texto) y enlace a la
     votación oficial en congreso.es.
   - **Intervenciones**: citas textuales de oradores del grupo en los debates de esas votaciones,
     con nombre del orador y fecha.

Flujo de datos del usuario: cuadrícula → celda → vista de cruce → votación oficial o sesión.

## Archivos

| Archivo | Función |
|---|---|
| `src/app/posiciones/page.tsx` | Cuadrícula (tabla temas × grupos). Lee recuentos y síntesis y enlaza cada celda a la vista de cruce. |
| `src/app/posiciones/test/page.tsx` | Vista de cruce. Lee `cruzar()` y la síntesis guardada o generada. |
| `src/lib/cruce.ts` | Lógica de datos. `recuentos()` y `cruzar(partido, tema)`. Lee `data/` en build/servidor. |
| `src/lib/sintesis.ts` | `sintetizar()`: pide a la IA un resumen de máximo 400 caracteres de las razones. Caché en memoria. |
| `src/lib/ia.ts` | Cliente de la API del modelo (HelmCode, compatible con OpenAI). Solo servidor. Reintenta ante 429. |
| `scripts/sintesis.ts` | Genera `src/config/sintesis.json` (síntesis por grupo y tema). Reanudable. |
| `src/config/sintesis.json` | Síntesis guardadas: clave `GRUPO\|tema`, valor texto. 53 entradas. Generado, no editar a mano. |
| `src/config/partidos.json` | Grupos con entrada = columnas de la cuadrícula. El Grupo Mixto no entra. |

## Datos de origen

Todo sale de `data/` (volcado de Escaño Abierto, commit en `data/source.json`). No se llama a red.

- `data/votaciones/AAAA-MM.json`: por votación, `tm` (temas), `grupos` (sentido por grupo: `S`, `N`,
  `A`, `D`, `?`), `json` (enlace oficial), `porque` (razón de voto por grupo: texto, orador, expediente, fecha).
- `data/sesiones/AAAA-MM.json`: sesiones, con `puntos` (`itemId` y `votos`).
- `data/items/AAAA-MM.json`: orden del día. La posición en esta lista es el número de `item`.
- `data/intervenciones/AAAA-MM.json`: intervenciones (`s` sesión, `item`, `orador`, `g` grupo, `cita` opcional).

## Lógica

### `recuentos()`

Recorre todas las votaciones y cuenta, por tema y grupo, cuántas veces votó cada sentido.
Resultado: `tema → grupo → { S, N, A, D, "?" }`. Alimenta la cuadrícula.

### `cruzar(partido, tema)`

1. Filtra las votaciones que tienen el `tema` en `tm` y el grupo en `grupos`.
2. Para cada votación añade el sentido del grupo a `votos`.
3. Toma la `porque` del grupo como razón (sin repetir el mismo texto) para la síntesis.
4. Busca la sesión que contiene la votación (`puntos[].votos`) y el punto del orden del día
   (`itemId` → índice en `items`).
5. Añade a `intervenciones` las del mismo grupo, en la misma sesión y el mismo `item`, que tengan `cita`.
6. Ordena todo por fecha.

### Síntesis

- `sintetizar()` manda las razones del grupo al modelo con instrucciones de no añadir hechos,
  no comparar con otros grupos y no recomendar nada. Corta a 400 caracteres en la última frase completa.
- En la vista de cruce se usa primero la síntesis guardada en `sintesis.json`; si no existe, se genera al vuelo.
- `scripts/sintesis.ts` rellena `sintesis.json` por lotes (6 en paralelo). Relanzar con
  `node --env-file=.env.local scripts/sintesis.ts`. Necesita `HELMCODE_API_KEY` y `HELMCODE_MODEL` en `.env.local`.

## Reglas de neutralidad aplicadas (AGENTS.md)

- Grupos y temas en orden alfabético, nunca por resultado. Sin podio ni «tu partido es».
- Abstención mostrada como abstención, nunca como voto en contra.
- Cifras solo como recuento, sin calificativos («rebelde», «leal»…).
- Texto de IA etiquetado como generado y mostrado junto al registro oficial.
- Cada página con `<Fuentes />`, `BotonAviso` y el aviso de herramienta experimental (en el layout).

## Estado y pendientes

Hecho:
- Cuadrícula con recuentos y síntesis, enlazada a la vista de cruce.
- Vista de cruce con síntesis, votaciones e intervenciones.
- Síntesis por lotes (`scripts/sintesis.ts`) con 53 entradas generadas.

Pendiente o a revisar:
- **Vista de prueba.** La ruta definitiva sería `src/app/[tema]/[partido]/` (plan del equipo). Hoy es `/posiciones/test`.
- **Texto de la celda.** El plan propone una posición calculada por votos (umbral 80 %, mayoría,
  «dividido») en `src/lib/posicion.ts`. No existe. La celda usa la síntesis de razones y el recuento.
- **Citas no verificadas.** El volcado no trae `cita_verificada`. La regla 6 de AGENTS.md exige cita literal
  verificada. El pie de la vista de cruce dice «Las citas son textuales del Diario de Sesiones»: hay que
  verificarlo (muestra de 20 citas contra el PDF) o cambiar el texto.
- **Citas sin filtro de posición.** `cruzar()` toma todas las citas del grupo en esos debates. No se filtra
  por las que expresan la posición del grupo. Los registros de intervención traen `pos` y `frase`, que podrían usarse.
- **Solo Pleno.** No se muestra órgano (Pleno/Comisión).
- **Deduplicación compartida.** `cruzar()` usa un único `Set` para razones y citas: una razón igual a una cita
  se oculta en una de las dos listas. Separar los dos conjuntos.
- **Rendimiento.** `cruzar()` y `recuentos()` releen todos los meses en cada petición. Basta con build estático;
  si se sirve en vivo, cachear.
- **Sin tests.** `cruce.ts`, `sintesis.ts` y la cuadrícula no tienen tests (AGENTS.md exige test para
  cada función nueva de `src/lib/datos.ts`; aquí conviene igual).
- **Cambios sin commitear** en `src/app/posiciones/*`: nombres de import en minúscula (`boton-aviso`, `fuentes`)
  y quitado `id="contenido"` / `tabIndex` del `main`. Revisar antes de commitear. Comprobar si `layout.tsx` depende de `id="contenido"` (enlace de salto).

## Cómo probar

```
bun install --frozen-lockfile
bun run dev
```

Abrir `/posiciones`, pulsar una celda con datos y comprobar: recuento, síntesis con aviso de IA, votaciones con
enlace oficial y citas. Revisar a 320 px sin scroll horizontal de la página (la tabla hace scroll en su caja).

## Fuentes

- Congreso de los Diputados · Votaciones del Pleno y Diario de Sesiones: https://www.congreso.es
- Escaño Abierto (datos, CC BY 4.0): https://github.com/jorgegarcelan/escano-abierto
