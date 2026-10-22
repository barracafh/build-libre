# Qué hacen otros proyectos: filtros y funciones

Revisión de webs parecidas de otros países (comparadores de afinidad y seguidores de votaciones
parlamentarias) para decidir qué filtros añadir. Investigación del 20 de octubre de 2026. Cada
afirmación remite a una fuente de la lista final [n].

## Resumen

- Los seguidores de votaciones coinciden en los mismos filtros: **tema, fecha y búsqueda por texto**;
  casi todos añaden **grupo/partido y resultado**; varios, **tipo de votación** y **disidencia o
  cohesión**. Dentro de una votación, filtrar a los diputados por **grupo, circunscripción y voto** es
  lo habitual [1, 2, 4, 5, 7, 11, 13, 14].
- Los comparadores de afinidad añaden **peso por tema** y **elección de partidos**, pero los más
  cuidadosos con la neutralidad **evitan una lista ordenada de partidos** (Kieskompas) o dejan el
  peso como paso opcional y separado (StemWijzer, Wahl-O-Mat) [15, 16, 20].
- Patrones de interfaz útiles en móvil: botones de filtro rápido sobre la lista, el número de
  resultados junto a cada opción, recuentos por grupo que abren la lista ya filtrada, filtros
  secundarios plegados y un enlace para limpiar [1, 5, 7, 11, 13].

## Por proyecto

### Seguidores de votaciones

- **HowTheyVote.eu (Parlamento Europeo).** Búsqueda libre; orden por relevancia, más nuevas o más
  antiguas; fechas con desde/hasta y atajos («legislatura actual», «este año», «últimos 30 días»);
  filtros por tema, país y comisión, cada valor con su número de resultados. En cada votación, los
  eurodiputados se filtran por nombre o partido, grupo, país y voto. No incluye enmiendas ni
  correcciones de voto, por alcance de datos [1, 2, 3].
- **GovTrack (EE. UU.).** Filtros por sesión, cámara, categoría y aprobada/rechazada. Ordena por
  apoyo, rechazo, margen más amplio o más estrecho y menor uniformidad de partido: el margen y la
  cohesión son criterios de primer nivel [4].
- **abgeordnetenwatch.de (Alemania).** Búsqueda, unos 30 temas con subtemas, rango de fechas y
  «mostrar todos los filtros». En cada votación, el recuento por grupo enlaza a la tabla de
  diputados ya filtrada por grupo y voto, que también se filtra por circunscripción. Neutralidad
  vigilada por un patronato plural [5, 6, 7, 24].
- **TheyWorkForYou (Reino Unido).** Filtrado ligero; su eje son resúmenes por política con
  criterios públicos de qué votaciones cuentan. Rebaja las mociones declarativas a «informativas»,
  **no cuenta las ausencias** porque no se puede saber qué significan y describe las votaciones con
  nombres neutros [8, 9].
- **Public Whip (Reino Unido).** Búsqueda única por código postal, diputado o tema; lista de
  votaciones «polémicas»; **clasificaciones de diputados por rebeldía y asistencia**. Es el ejemplo
  claro de lo que no queremos [10].
- **Openpolis (Italia).** Botones rápidos «voto clave / voto final / cuestión de confianza / todas»;
  filtros por resultado, tipo de acto, año, cámara, gobierno y cohesión de la mayoría; orden por
  fecha, cohesión, rebeldes o margen. Cada tarjeta muestra el margen y el número de rebeldes. Los
  «votos clave» los elige su redacción (347 de unos 28.000); rebelde es quien vota distinto a su
  grupo [11, 12].
- **577deputes.fr (Francia; NosDéputés no respondía).** Filtro aprobada/rechazada, orden y botón de
  limpiar. Marca «poca afluencia» cuando votan pocos diputados y lo explica en una nota, sin
  juzgarlo [13].
- **Qué Hacen los Diputados (España).** Filtra iniciativas por temática y grupo, muestra su estado y
  quién las propone, y tiene una vista de prioridades temáticas por grupo. Sigue iniciativas, no
  votaciones del Pleno [14].

### Comparadores de afinidad

- **Wahl-O-Mat (Alemania).** Respuestas de acuerdo / desacuerdo / neutral o saltar; peso doble
  opcional; elección libre de partidos y ajuste para que el peso cuente o no; comparación de hasta
  3 partidos; argumentos de cada partido por pregunta. Dice no ser una recomendación de voto, aunque
  el resultado es una lista ordenada [15].
- **StemWijzer (Países Bajos).** Solo de acuerdo / en desacuerdo / ninguna. La importancia se marca
  después y aparte («extra importante»). Descarta las preguntas en las que todos los partidos están
  de acuerdo, busca equilibrio entre temas y no guarda resultados ni usa cookies [16].
- **smartvote (Suiza).** Peso x2 o x0,5 por respuesta; las preguntas saltadas no cuentan. Avisa de
  que un 70 % de coincidencia no significa un 70 % de respuestas iguales [17, 23].
- **Vote Compass (Canadá, Australia) e isidewith.** Importancia ajustable por tema. Vote Compass
  dice no ser consejo de voto; isidewith presenta el resultado como «a quién deberías votar», lo
  contrario de nuestro enfoque [18, 19].
- **Kieskompas (Países Bajos).** Rechaza expresamente «una lista de partidos que parezca un consejo
  de voto»: sitúa al usuario y a los partidos en un mapa político y contrasta sus respuestas con
  documentos oficiales [20].
- **Literatura académica.** Los resultados dependen mucho del diseño (hasta un 90 % de diferencia
  según la fórmula de distancia). Se recomienda mostrar varias vistas, las respuestas por pregunta y
  por partido, y documentar el diseño. La Declaración de Lausana pide transparencia, imparcialidad y
  un algoritmo explicado [21, 22]. Son resúmenes secundarios; no se leyeron los artículos
  originales.

## Top 5 de filtros para nuestra web

1. **Explorador de votaciones** con tema, fecha (atajos por año y rango) y búsqueda por texto, con el
   recuento junto a cada opción y los filtros en el enlace. De la más reciente a la más antigua,
   nunca por «importancia» [1, 5, 8, 14].
2. **Tipo de votación y proponente**: «Leyes y convalidaciones / PNL y mociones / Enmiendas /
   Todas» y quién la propone. Explica que una PNL no obliga y una convalidación sí [4, 9, 11].
3. **Posición de un grupo y comparar 2 o 3 grupos**: «votaron igual / distinto», sin porcentaje de
   afinidad ni grupos preseleccionados [5, 15].
4. **Margen**: «ajustada» o «amplia» y ocultar las casi unánimes, con el umbral publicado. Sirve
   también para elegir con un criterio objetivo las votaciones de la consulta personal [4, 11, 16].
   El filtro «aprobada / rechazada» queda fuera: nuestros datos no lo dicen con seguridad.
5. **Disidencia y diputados dentro de cada votación**: «con diputados que votaron distinto a su
   grupo» y filtros por grupo, provincia y voto, con los recuentos por grupo enlazados. Sin la
   palabra «rebelde», sin contar ausencias y sin el Grupo Mixto [2, 7, 9, 11].

## Qué evitar

- **Clasificaciones de diputados o partidos** (más rebeldes, más asistencia, «más afín a ti») [10].
- **Un porcentaje total de coincidencia ponderado**: en la práctica es una recomendación de voto y
  depende del diseño. Coincidencias solo por tema; si se pregunta la importancia, que solo ordene la
  vista del usuario [15, 16, 17, 20, 21].
- **Filtros sobre texto generado por IA** (tono o postura de las intervenciones) y «votaciones
  clave» elegidas sin criterio publicado [12].

## Fuentes

1. [All Votes · HowTheyVote.eu](https://howtheyvote.eu/votes)
2. [HowTheyVote.eu, página de una votación con filtros](https://howtheyvote.eu/votes/197464)
3. [About · HowTheyVote.eu](https://howtheyvote.eu/about)
4. [Congressional Votes Database · GovTrack](https://www.govtrack.us/congress/votes)
5. [Bundestag, Abstimmungen · abgeordnetenwatch](https://www.abgeordnetenwatch.de/bundestag/abstimmungen)
6. [abgeordnetenwatch, página de una votación](https://www.abgeordnetenwatch.de/bundestag/21/abstimmungen/aenderung-des-brennstoffemissionshandelsgesetzes-co2-preis)
7. [abgeordnetenwatch, tabla con filtros por circunscripción y grupo](https://www.abgeordnetenwatch.de/bundestag/21/abstimmungen/aenderung-des-brennstoffemissionshandelsgesetzes-co2-preis/tabelle)
8. [Recent Votes · TheyWorkForYou](https://www.theyworkforyou.com/divisions/)
9. [Voting and decisions · TheyWorkForYou](https://www.theyworkforyou.com/voting-information)
10. [The Public Whip](https://www.publicwhip.org.uk/)
11. [Votazioni · openparlamento (Openpolis)](https://parlamento19.openpolis.it/votazioni)
12. [FAQ · openparlamento (Openpolis)](https://parlamento19.openpolis.it/faq)
13. [Scrutins publics · 577deputes.fr](https://577deputes.fr/scrutins)
14. [Qué hacen los diputados](https://quehacenlosdiputados.es/)
15. [Wie funktioniert der Wahl-O-Mat? · bpb](https://www.bpb.de/themen/wahl-o-mat/294576/wie-funktioniert-der-wahl-o-mat/)
16. [Veelgestelde vragen · StemWijzer](https://source.stemwijzer.nl/faq/)
17. [smartvote FAQ](https://www.smartvote.ch/en/faq)
18. [Vote Compass methodology · Vox Pop Labs](https://files.voxpoplabs.com/votecompass/methodology.pdf)
19. [2024 Presidential Quiz · iSideWith](https://www.isidewith.com/elections/2024-presidential-quiz)
20. [Kieskompas · Tools](https://www.kieskompas.nl/en/tools/)
21. [Trustworthiness of voting advice applications in Europe (Ethics and Information Technology, 2024)](https://link.springer.com/article/10.1007/s10676-024-09790-6)
22. [Designing Voting Advice Applications (tesis, Aalto; resume la Declaración de Lausana)](https://aaltodoc.aalto.fi/server/api/core/bitstreams/fd01f1d3-5c5f-4189-a4f9-45a18a2b2dd5/content)
23. [smartvote Australia (ACT), metodología de coincidencia](https://act.smartvote.org/assets/pdf/Positional_matching_methodology_ACT.pdf)
24. [abgeordnetenwatch FAQ](https://www.abgeordnetenwatch.de/ueber-uns/faq)
