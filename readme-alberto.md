# Escáner político: qué quiero representar

## La idea

Una página que pasa por un «escáner» los programas electorales de las generales de 2023 (23J) de
**PP, PSOE, Sumar y Vox** y compara cada cosa que dicen con lo que votaron después en el Pleno del
Congreso durante la XV legislatura (septiembre de 2023 a octubre de 2026).

La pregunta que responde: **«¿Qué decía este partido sobre este tema en 2023 y cómo votó después?»**.
Muestra hechos con su fuente y cada persona saca sus conclusiones. No recomienda a quién votar.

## El recorrido

1. **Al entrar** solo se ven las cuatro hojas de los programas, marcadas como «Programa electoral
   2023», y un botón «Escanear los programas».
2. **Al escanear**, un haz recorre las hojas. Cada frase del programa se ilumina y toma el color de
   lo que votó el partido. Suben los contadores («X de Y votos en contra de su programa») y aparecen
   los temas encontrados dentro del escáner.
3. **Al terminar**, los temas salen del escáner por una ranura y caen en una lista debajo. Cada tema
   muestra sus frases, sus votaciones del Pleno y la «brecha dicho-hecho». Se pueden ordenar.
4. **Dentro de un tema**, una fila por partido con su posición en una frase corta (marcada IA) y una
   barra: a favor de lo que dice su programa (verde), en contra (rojo), abstención o dividido (gris).
5. **Al abrir un partido**, su posición completa y el programa con sus frases literales y su página.
   Bajo cada frase, las votaciones que la cumplen o la contradicen, cada una con:
   - qué se votaba, quién lo propuso y qué votó el partido;
   - por qué se relaciona con la frase (IA);
   - el hemiciclo con el recuento real y el resultado;
   - el motivo que dio el grupo en el debate (IA), cuando votó en contra;
   - el enlace a la fuente oficial en congreso.es;
   - artículos de prensa que cubren esa votación, o una búsqueda de noticias si no encontramos.
6. **Otras vistas**: cómo votó cada partido en todo el tema, cuánto pesa el tema en los programas
   frente a las votaciones, «Lo que no se ve» y «Cómo lo contamos».

El diseño visual sigue el prototipo «Escáner político» (Sol, el sistema de Reforma Digital), con
datos reales en lugar de simulados.

## De dónde salen los datos

- **Programas**: PDF oficiales de 2023 en `docs/programas-2023/pdf/`.
- **Categorías y temas**: cada programa partido en capítulos y asignado a los 21 temas de las
  votaciones (`docs/programas-2023/categorias/`).
- **Posiciones**: por partido y tema, una posición general (IA), una frase corta y frases literales
  del programa (`docs/programas-2023/posiciones/`).
- **Votaciones**: 2.185 votaciones del Pleno de Escaño Abierto (`data/`), con el voto de cada
  diputado. El texto de lo que se votaba sale del Boletín Oficial de las Cortes.
- **Enlace frase-votación**: una IA juzga a ciegas, sin saber el partido ni el voto, si cada
  votación cumple, avanza o contradice la frase. Una regla fija decide el resultado con el voto de
  los diputados elegidos en la candidatura (umbral del 80 %).
- **Prensa**: artículos comprobados uno a uno (`docs/programas-2023/posiciones/noticias.json`).
- **La página**: `scripts/build-escaner.ts` genera `src/datos/escaner.json`; la vista está en
  `src/components/Escaner.tsx` y `src/styles/escaner.css`.

## Reglas que quiero mantener

- Cifras reales siempre. Nada inventado ni inflado; si algún día hay una demo con cifras simuladas,
  va marcada como «Datos simulados».
- Cada votación enlaza a su fuente oficial. La prensa va aparte y marcada como no oficial.
- El texto escrito por una IA lleva la etiqueta **IA**.
- Partidos en orden alfabético. Sin rankings, sin afinidad entre partidos ni con el usuario.

## Cómo leer los resultados

- «Sin votación relacionada» no es incumplir: mucho de un programa nunca se vota en el Pleno.
- Muchas votaciones son mociones y proposiciones no de ley de la oposición: no obligan y mezclan
  peticiones con críticas al Gobierno. Por eso el PSOE acumula más «en contra»: la mayoría son
  mociones del PP y de Vox.
- Una moción con varios puntos votada entera no cuenta para ninguna frase.

## Pendiente

- Buscar prensa para las 54 iniciativas que se quedaron sin artículo.
- Revisar a mano los juicios dudosos (`docs/programas-2023/posiciones/revision.md`).
- `ficha.json`: nombre «Escáner político» y `datos: reales` (avisar al equipo antes).
- Confirmar con el equipo el verde, el rojo y los colores de partido: `DESIGN.md` y las normas del
  concurso no permiten añadir colores ni marcar votos con color.
- Next.js 16.4.0 avisa de una vulnerabilidad conocida; actualizarlo toca `package.json` y `bun.lock`.
