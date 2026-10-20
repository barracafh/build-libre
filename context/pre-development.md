# Reforma Digital: lo que ya existe

github.com/samuelcorsan/reforma-digital

Proyecto abierto de Samuel Corsán y Leo. Código MIT, datos CC BY 4.0. Muy activo (commits diarios).

## El Congreso (reforma-digital.es/congreso)

- Cada votación del Pleno con el voto de cada diputado
- Leyes desde que entran hasta que se publican, con filtros
- Plenos resumidos e intervenciones analizadas (más de 1.500)
- "Quién te representa": ficha por diputado
- 21 temas fijos (vivienda, sanidad, pensiones…) asignados por palabras clave, sin IA

## Elecciones 29N (reforma-digital.es/elecciones)

- Calendario electoral, lo que caduca (304 leyes), la legislatura en cifras
- Encuestas, proyección de escaños, mercados y cuánto acertaron
- Histórico desde 1977, mapa municipio a municipio, reparto de escaños por provincia

## Datos reutilizables

- API pública de solo lectura con CORS: /api/congreso/votaciones, /preguntas, /sesiones, /datasets y descarga completa en /api/congreso/descarga
- Recolector en Python basado en Escaño Abierto (Jorge Garcelán), con fuentes oficiales del Congreso y el BOE

## Hecho pero no publicado en la web

- promesas.py: cruza los programas de 2023 de 10 partidos con lo que votó después cada candidatura. No mide si se cumplió la promesa, sino qué votó el partido sobre lo que prometió.

## Lo que no tiene

- Un test de afinidad del tipo "qué partido vota como tú piensas". Ese es nuestro hueco: podemos montarlo sobre su API sin rehacer la ingesta.

# Propuesta: qué aportamos sobre Reforma Digital

## Enfoque

Reforma Digital se organiza por institución (sesiones, diputados, votaciones). Nosotros partimos de la pregunta del votante: "¿qué hizo cada partido sobre lo que me importa?". Solo elecciones, solo consultivo: nunca decimos a quién votar.

Reutilizamos su API pública: cada votación ya trae el voto de cada grupo, así que no hay que montar ingesta.

## Tres niveles, de lo simple al detalle

1. Vistazo: tarjeta por tema con 3-5 votaciones clave en lenguaje claro y un punto de color por partido (a favor / en contra / abstención).
2. Tema: todas sus votaciones, filtrables, con lo que dijo cada grupo en el debate.
3. Fuente: la votación oficial en congreso.es y la ficha de Reforma Digital con el voto de cada diputado.

Cada dato lleva al nivel siguiente: portada limpia, investigación libre.

## Piezas

- Posiciones por tema: cuadrícula partidos x temas (vivienda, sanidad, pensiones, inmigración…). Es la pieza central.
- Comparador: eliges 2-3 partidos y ves en qué votaron igual y en qué distinto.
- Promesas vs votos: programa de 2023 frente a lo que votó cada partido después (Reforma Digital lo calcula pero no lo publica; hay que confirmar si los datos son descargables).
- Tu provincia: candidatos (listas en el BOE el 28 oct), quién repite y cómo votó.
- Consulta personal: el usuario marca su postura en las votaciones clave y ve coincidencias con cada partido, tema a tema.
- Extra si da tiempo: programas de 2026 por tema con cita literal, cuando se publiquen.

## Reglas para que sea consultivo

- Sin ganador, sin podio, sin "tu partido es…".
- Partidos en orden alfabético o aleatorio, nunca por resultado.
- El usuario elige qué temas le importan y cuánto pesan.
- Cada coincidencia con su "ver por qué" enlazado a la votación.
- Avisos honestos: partidos sin historial de voto (p. ej. SALF), votos de procedimiento, abstención mostrada como abstención.
- Método público; todo se calcula en el navegador y no se guardan respuestas.

## Decisión abierta

En la consulta personal, ¿solo coincidencias por tema ("en vivienda coincides 4 de 5 con X") o también un % total por partido? Propuesta: solo por tema, es lo que menos empuja hacia un voto.

# Recomendación de arquitectura

## Stack

- Next.js en monorepo (pnpm + Turborepo), Postgres y recolector en Python. Mismo stack que Reforma Digital: lo que hagamos podría acabar dentro de su proyecto como un módulo más, y su comunidad ya lo conoce.

## Datos: sitio estático, sin backend

- Una GitHub Action diaria descarga lo necesario de su API y lo guarda en JSON versionado en el repo. La web nunca llama a su API mientras alguien la usa: va más rápida, no depende de que su servicio esté caído y no les cargamos tráfico.
- Las votaciones clave de cada tema, explicadas en lenguaje claro, van en ficheros YAML dentro del repo; cada cambio se revisa con un PR. Cualquiera puede ver quién eligió qué votación y por qué, y eso da credibilidad a un proyecto consultivo.
- Todas las páginas se generan en el build (Next.js estático) y se despliegan en Vercel o Cloudflare Pages, gratis a este volumen.
- El comparador y la consulta personal se calculan en el navegador. No hay base de datos ni cuentas, no se guarda ninguna respuesta y no hace falta banner de cookies.

## Diseño claro

- Tailwind + shadcn/ui (componentes accesibles sobre Radix). Su repo tiene un DESIGN.md; si lo seguimos, parecerá parte de la misma familia.
- Pensado primero para móvil: la tarjeta de cada tema tiene que leerse entera en la pantalla del teléfono.
- El voto nunca se indica solo con color: icono y texto ("A favor", "En contra", "Abstención"), para daltónicos y lectores de pantalla. Objetivo WCAG AA.
- Paleta neutra: los colores de los partidos solo sirven para identificarlos, nunca para destacar a uno.
- Gráficos con CSS o Observable Plot, sin librerías pesadas.
- Buscador con Pagefind, estático, sin servidor.
- Una imagen para compartir generada por tema ("Vivienda: cómo votó cada partido"), que es como se va a difundir.
- Analítica sin cookies (Plausible) o ninguna.

## Obligatorio

- Sus datos son CC BY 4.0: hay que citar a Reforma Digital y a Escaño Abierto en cada página que los use.
