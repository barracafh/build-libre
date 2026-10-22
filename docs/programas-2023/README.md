# Programas 2023 por categorías

Los programas del 23J de los diez partidos con escaño (lista y enlaces en
[../2026-10-22-1809-programas-2023.md](../2026-10-22-1809-programas-2023.md)), divididos en
categorías y enlazados con los 21 temas (`tm`) de las votaciones de `data/votaciones/`. Análisis
interno del 22/10/2026: las normas prohíben mostrar resúmenes de programas en la herramienta.

Dashboard privado con estos datos: https://claude.ai/artifact/5bbgvAkSoBLuLD3xFLsGbe

## Ficheros

| Fichero | Contenido |
| --- | --- |
| `categorias/<PARTIDO>.json` | Por partido: `categories[]` con `title`, `pages` (rango del PDF), `words`, `topics` (hasta 3 de los 21 `tm`) y `note`. |
| `categorias.json` | Las 200 categorías en una tabla: `partido`, `n`, `categoria`, `pag_desde`, `pag_hasta`, `paginas`, `palabras`, `temas`, `tema_principal`, `nota`. |
| `temas_partido.json` | Por partido y tema: `categorias`, `palabras` y `cuota_programa` del programa, y en las votaciones del tema `a_favor`, `en_contra`, `abstencion`, `dividido`, `sin_voto`. |

## Método

- Cada programa se dividió por sus propios capítulos o, si un capítulo mezclaba áreas, por sus
  secciones. Los rangos de páginas son contiguos: toda página cae en una sola categoría. Portada
  e índice van en una categoría sin temas.
- Los temas los asignaron agentes de IA leyendo el texto. Puede haber errores de una página en los
  bordes y asignaciones discutibles. En el PP se añadió a mano `inmigracion` a «Liderar e influir»
  (págs. 94–102).
- El peso de un tema reparte las palabras de cada categoría a partes iguales entre sus temas.
- La posición de cada grupo sale de `grupos` de Escaño Abierto. BNG y UPN tienen un diputado y se
  usa su voto. Una votación con varios temas cuenta en cada uno.
- Coalición Canaria no publicó programa para las generales de 2023.
- Los PDF no se guardan en el repo.
