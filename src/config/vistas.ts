// The site's views, in menu order. Adding a view = one line here; the shell and the home read it.
export const vistas = [
  {
    ruta: "/tema",
    nombre: "Temas",
    descripcion: "Cómo votó cada grupo en el Congreso en cada tema, votación a votación.",
  },
  {
    ruta: "/posiciones",
    nombre: "Posiciones",
    descripcion: "Posiciones por grupo y tema, con síntesis generadas por IA y el detalle de las votaciones.",
  },
  {
    ruta: "/estadisticas",
    nombre: "Estadísticas",
    descripcion: "Prototipo de interfaz con datos simulados; no representa votaciones reales.",
  },
  {
    ruta: "/escaner",
    nombre: "Escáner",
    descripcion: "Los programas de 2023 de PP, PSOE, Sumar y Vox frente a lo que votaron después en el Pleno.",
  },
] as const;
