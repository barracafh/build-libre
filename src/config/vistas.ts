// The site's views, in menu order. Adding a view = one line here; the shell and the home read it.
export const vistas = [
  {
    ruta: "/iniciativas",
    nombre: "Iniciativas votadas",
    descripcion: "Cómo votó cada grupo en el Congreso en cada tema, votación a votación.",
  },
  {
    ruta: "/posiciones",
    nombre: "Posiciones",
    descripcion: "Posiciones por grupo y tema, con síntesis generadas por IA y el detalle de las votaciones.",
  },
  {
    ruta: "/posturas",
    nombre: "Posturas",
    descripcion: "Qué prometió y qué votó cada grupo, con comparaciones por tema y medida.",
  },
  {
    ruta: "/escaner",
    nombre: "Escáner",
    descripcion: "Los programas de 2023 de PP, PSOE, Sumar y Vox frente a lo que votaron después en el Pleno.",
  },
] as const;
