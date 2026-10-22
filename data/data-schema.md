# Esquema de datos · `data/`

Referencia de los campos de cada entidad del volcado de la XV legislatura. Debajo de cada tabla va el primer registro del fichero, tal como aparece (los textos largos van acortados con «…»).

Origen: Escaño Abierto (commit fijado en `source.json`). Ver también `README.md` de esta carpeta. Los campos marcados «(observado)» no están documentados en ese README; se han visto en los ficheros.

## Votaciones

`votaciones/YYYY-MM.json` · array

| Campo | Significado |
|---|---|
| `id` | id votación (`sesión-votación`, p. ej. `203-1`) |
| `fecha` | fecha |
| `tipo` | tipo de votación |
| `titulo` | título |
| `titulo_fuente` | origen del título (observado) |
| `texto` | texto de la votación (observado) |
| `proponente` | proponente |
| `exp` | nº de expediente |
| `si` / `no` / `abst` / `novota` | totales |
| `grupos` | sentido mayoritario por grupo: `S` sí, `N` no, `A` abstención, `D` dividido, `?` desconocido |
| `conteo` | por grupo, cuántos diputados votan cada letra |
| `discrepantes` | diputados que se apartan de su grupo |
| `json` | URL de la votación oficial en congreso.es |
| `v` | voto por diputado: 1 carácter por diputado (`S`, `N`, `A`, `X` no vota, `-` no era diputado). Posición = índice en `indice.json → diputados` |
| `porque` | opcional. Por grupo: `[razón, orador, id sesión, fecha]` |
| `tm` | temas |
| `cg` | opcional. Mapa posición en `v` → grupo, si difiere del de `indice` |

Ejemplo (primer registro de `votaciones/2026-10.json`):

```json
{
  "id": "203-1",
  "fecha": "2026-10-02",
  "tipo": "Convalidación RDL",
  "titulo": "RDL 26/2026 por el que se adoptan medidas urgentes para la protección de la función social de la vivienda y…",
  "titulo_fuente": "oficial",
  "texto": "Real Decreto-ley 26/2026, de 29 de septiembre, por el que se adoptan medidas urgentes para la protección de la función social de la vivienda y la ampliación de la oferta de vivienda asequible.",
  "proponente": "GOB",
  "exp": "130/000055",
  "si": 172, "no": 178, "abst": 0, "novota": 0,
  "grupos": {"SUMAR": "S", "PSOE": "S", "JUNTS": "N", "ERC": "S", "BILDU": "S", "PNV": "S", "MIXTO": "D", "PP": "N", "VOX": "N"},
  "conteo": {"SUMAR": {"S": 26}, "PSOE": {"S": 121}, "JUNTS": {"N": 7}, "ERC": {"S": 7}, "BILDU": {"S": 6}, "PNV": {"S": 5}, "MIXTO": {"S": 7, "N": 2}, "PP": {"N": 137}, "VOX": {"N": 32}},
  "discrepantes": [],
  "json": "https://www.congreso.es/public_oficiales/L15/CONG/DS/PL/DSCD-15-PL-210.PDF",
  "v": "SSSSSS--SSSSSSSNNNNNNN-SNSNSSSSS--S-SSSS…",
  "porque": {"PNV": ["Vota a favor por responsabilidad institucional…", "Vaquero Montero", "DSCD-15-PL-210", "2026-10-02"], "…": "…"},
  "tm": ["vivienda"]
}
```

## Sesiones

`sesiones/YYYY-MM.json` · array

| Campo | Significado |
|---|---|
| `id` | id (`DSCD-15-PL-210`, o `votos-AAAA-MM-DD`) |
| `fecha` | fecha |
| `organo` | `Pleno` o comisión |
| `sesion` | nº de sesión (observado) |
| `ds` | URL del Diario de Sesiones (PDF), `null` si no hay |
| `dsNombre` | nombre del Diario (observado) |
| `titular` | texto generado por modelo |
| `resumen` | texto generado por modelo |
| `momentos` | lista generada por modelo, `{que, quien[]}` (observado) |
| `reacciones` | (observado) |
| `turnos` | (observado) |
| `termometro` | turnos y reacciones por grupo |
| `puntos[]` | puntos del orden del día debatidos |
| `puntos[].tipo` | tipo del punto |
| `puntos[].titulo` | título del punto |
| `puntos[].exp` | expediente, si se conoce |
| `puntos[].estado` | `analizado`, `pendiente`, `sin-ds` |
| `puntos[].itemId` | texto del punto tal como sale en el Diario. Enlaza con `items` |
| `puntos[].votos` | ids de votaciones de ese punto |

Ejemplo (primer registro de `sesiones/2026-10.json`):

```json
{
  "id": "DSCD-15-PL-210",
  "fecha": "2026-10-02",
  "organo": "Pleno",
  "sesion": "Sesión nº 203",
  "ds": "https://www.congreso.es/public_oficiales/L15/CONG/DS/PL/DSCD-15-PL-210.PDF",
  "dsNombre": "DSCD-15-PL-210",
  "titular": "El Pleno rechaza los dos decretos leyes del Gobierno sobre vivienda y arrendamientos",
  "resumen": "El Congreso de los Diputados ha debatido y votado dos reales decretos leyes…",
  "puntos": [
    {
      "tipo": "Convalidación o derogación de reales decretos leyes",
      "titulo": "Gobierno · Real Decreto-ley sobre función social y oferta de vivienda",
      "exp": "130/000055",
      "estado": "analizado",
      "itemId": "Real Decreto Ley 26/2026, de 29 de septiembre, por el que se adoptan medidas urgentes para la protección de la función social de la vivienda y…",
      "votos": ["203-1"]
    },
    {"…": "segundo punto, votos [\"203-2\"]"}
  ],
  "momentos": [
    {"que": "Nogueras i Camero exige a la ministra la retirada del decreto de vivienda…", "quien": ["Nogueras i Camero"]}
  ],
  "reacciones": {"aplausos": 153, "rumores": 47, "protestas": 17, "llamadas_al_orden": 1, "risas": 10},
  "turnos": 48,
  "termometro": {"GOB": {"turnos": 7, "aplausos": 48, "rumores": 7, "protestas": 4, "risas": 1}, "…": "…"}
}
```

## Intervenciones

`intervenciones/YYYY-MM.json` · array

| Campo | Significado |
|---|---|
| `s` | id de sesión |
| `item` | posición en `items/YYYY-MM.json` del mismo mes |
| `orador` | apellido tal como en el Diario |
| `g` | código de grupo |
| `rol` | (observado) cargo o grupo |
| `pos` | (observado) generado por modelo: `a favor`, `en contra`, `abstención` o ausente |
| `tono` | generado por modelo |
| `int` | generado por modelo, intensidad 1–5 |
| `temas` | generado por modelo |
| `cita` | cita textual. Ausente en algunos registros |
| `frase` | resumen generado por modelo |
| `responde` | `sí`, `no`, `parcial`, `no aplica` |
| `responde_motivo` | motivo de `responde`, cuando existe |
| `d` | posición del texto largo en `site/datos/iv/<id sesión>.json` (no incluido en el snapshot) |

Ejemplo (primer registro de `intervenciones/2026-10.json`):

```json
{
  "s": "DSCD-15-PL-210",
  "item": 0,
  "orador": "Rodríguez García",
  "g": "GOB",
  "rol": "Ministra de Vivienda y Agenda Urbana",
  "pos": "a favor",
  "tono": "combativo",
  "int": 4,
  "temas": ["vivienda", "desahucios", "alquiler", "especulación inmobiliaria", "fiscalidad"],
  "responde": "no aplica",
  "frase": "Defiende el decreto sobre vivienda y pide el apoyo parlamentario para frenar los desahucios y la especulación.",
  "d": 0
}
```

Este registro no tiene `cita`.

## Items

`items/YYYY-MM.json` · array de textos (observado)

Cada elemento es el texto de un punto del orden del día, referenciado por posición desde `intervenciones.item`.

Ejemplo (primer elemento de `items/2026-10.json`):

```json
"Real Decreto Ley 26/2026, de 29 de septiembre, por el que se adoptan medidas urgentes para la protección de la función social de la vivienda y la ampliación de la oferta de vivienda asequible. (B.O.E. núm. 241, de 30 de septiembre de 2026). (Número de expediente. 130/000055)"
```

## Índice

`indice.json` · objeto

| Campo | Significado |
|---|---|
| `meta` | `periodo`, `generado`, `datos_hasta`, `legislatura` |
| `grupos` | por código: `nombre`, `color`, `codigo`, `escanos` |
| `diputados` | array de filas `[nombre, grupo, circunscripción, partido, alta, x, y, código escaño, baja]` (la posición es la clave de `v`) |
| `hemiciclo` | seat plan (ver `hemiciclo.json`) |
| `meses` | por mes: `sesiones`, `votaciones`, `intervenciones` |
| `agenda` | `plenos`, `comisiones` (vacíos en el snapshot) |
| `semanas` | lista de semanas (`AAAA-SNN`) |

Ejemplo (primeros valores de cada campo):

```json
{
  "meta": {"periodo": "2023-08-17 – 2026-10-02", "generado": "2026-10-14", "datos_hasta": "2026-10-14", "legislatura": "XV"},
  "grupos": {"PSOE": {"nombre": "Grupo Socialista", "color": "#D8342B", "codigo": "PSOE", "escanos": 121}, "…": "…"},
  "diputados": [["Aizpurua Arzallus, Mertxe", "BILDU", "Gipuzkoa", "EH Bildu", "2023-08-14", 178, 107, 300, ""], "…"],
  "hemiciclo": {"gobierno": [{"nombre": "Cuerpo Caballero, Carlos", "cargo": "Vicepresidente Primero del Gobierno y Ministro de Economía, Comercio y Empresa", "x": 190, "y": 290}, "…"]},
  "meses": [{"mes": "2023-08", "sesiones": 1, "votaciones": 0, "intervenciones": 15}, "…"],
  "agenda": {"plenos": [], "comisiones": []},
  "semanas": ["2023-S33", "…"]
}
```

## Diputados

`diputados.json` · objeto por nombre (412 entradas)

| Campo | Significado |
|---|---|
| `circunscripcion` | circunscripción |
| `formacion` | grupo o partido |
| `alta` / `baja` | fechas de alta y baja |
| `biografia` | texto biográfico |

Ejemplo (primera entrada):

```json
"Ábalos Meco, José Luis": {
  "circunscripcion": "Valencia/València",
  "formacion": "PSOE",
  "alta": "2023-08-07",
  "biografia": "Suspendido en sus derechos y deberes parlamentarios por acuerdo de la Mesa de 10 de diciembre de 2025…",
  "baja": "2026-01-28"
}
```

## Hemiciclo

`hemiciclo.json` · objeto

| Campo | Significado |
|---|---|
| `escanos` | por nombre: `x`, `y`, `codigo` |
| `gobierno` | lista de `{nombre, cargo, x, y}` |
| `ancho` / `alto` | dimensiones del plano |

Ejemplo:

```json
{
  "escanos": {"Armengol Socias, Francina": {"x": 270, "y": 382, "codigo": 185}, "…": "…"},
  "gobierno": [{"nombre": "Cuerpo Caballero, Carlos", "cargo": "Vicepresidente Primero del Gobierno y Ministro de Economía, Comercio y Empresa", "x": 190, "y": 290}, "…"],
  "ancho": 540,
  "alto": 395
}
```

## Fuentes

`source.json` · objeto

| Campo | Significado |
|---|---|
| `name`, `repository`, `commit` | origen (Escaño Abierto, commit fijado) |
| `fetched` | fecha de descarga |
| `license` | `code` MIT, `data` CC BY 4.0 |
| `months` | `first`, `last`, `missing` |
| `files` | por fichero: `path`, `upstream`, `records` |

Ejemplo:

```json
{
  "name": "Escaño Abierto",
  "repository": "https://github.com/jorgegarcelan/escano-abierto",
  "commit": "365e56d6de9f4ad5da9c9a022f4c7ccf6c07a031",
  "fetched": "2026-10-19",
  "license": {"code": "MIT", "data": "CC BY 4.0"},
  "months": {"first": "2023-08", "last": "2026-10", "missing": ["2023-10"]},
  "files": [{"path": "data/votaciones/2023-08.json", "upstream": "site/datos/2023-08.json", "records": 0}, "…"]
}
```

## Elecciones 2023

`elecciones/resultados-2023.json` · objeto

| Campo | Significado |
|---|---|
| `id`, `fecha` | id `202307` y fecha |
| `prov` | por código INE de provincia: `e` (escaños), `censo`, `validos`, `blancos`, `nulos`, `c` (lista de `[siglas, familia, votos, escaños]`), `sin_escano`, `ultimo` |

Ejemplo (primera provincia del objeto `prov`, código `10`; el nombre se busca en `territorios.json`):

```json
{
  "id": "202307",
  "fecha": "2023-07-23",
  "prov": {
    "10": {
      "e": 4,
      "censo": 339491,
      "validos": 235851,
      "blancos": 1721,
      "nulos": 3896,
      "sin_escano": 52805,
      "c": [["PSOE", "PSOE", 91692, 2], ["PP", "PP", 89633, 2], ["VOX", "VOX", 32076, 0], "…"],
      "ultimo": {"gana": "PP", "segundo": "VOX", "faltan": 12741}
    },
    "…": "…"
  }
}
```

## Elecciones 2026

`elecciones/escanos-2026.json` · objeto

| Campo | Significado |
|---|---|
| `convocatoria`, `votacion`, `decreto`, `escanos`, `escanos_cambian`, `padron` | escaños por provincia en 2026, fuente, cambios respecto a 2023 y población base |

Ejemplo:

```json
{
  "convocatoria": "2026-10-06",
  "votacion": "2026-11-29",
  "decreto": {"rd": "Real Decreto 806/2026, de 5 de octubre", "boe": "BOE-A-2026-20742"},
  "escanos": {"10": 4, "11": 8, "12": 5, "…": "…"},
  "escanos_cambian": [["11", 9, 8], ["28", 37, 38]],
  "padron": {"anio": 2025, "pob": {"10": 387752, "11": 1257041, "…": "…"}}
}
```

## Territorios

`elecciones/territorios.json` · objeto

| Campo | Significado |
|---|---|
| `anios`, `fuentes`, `espana`, `ccaa` | (observado) |
| `provincias` | por código: `n` (nombre), `corto`, `ccaa`, `pob`, `serie`, `esc` (escaños 2023) |

Ejemplo (primera provincia, código `01`, y nivel superior):

```json
{
  "anios": [1996, 1998, 1999, "…"],
  "fuentes": {"padron": 2025, "renta": "2023", "edad": "2025", "envej": "2025", "vida": "2024", "paro": "2026T2"},
  "provincias": {
    "01": {
      "n": "Araba/Álava",
      "corto": "Álava",
      "ccaa": "16",
      "pob": 342161,
      "serie": [281821, 284595, "…"],
      "km2": 2957,
      "dens": 115.7,
      "mun": 51,
      "mun_peq": 29,
      "pob_peq": 13315,
      "pierden": 12,
      "renta": 17802,
      "mayor": ["01059", "Vitoria-Gasteiz", 260699],
      "edad": 45.7,
      "envej": 159.9,
      "vida": 85.02,
      "paro": 7.7,
      "esc": 4
    }
  }
}
```
