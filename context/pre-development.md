## Estructura de la app (descripción del estado actual)

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

