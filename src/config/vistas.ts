// The site's views, in menu order. Adding a view = one line here; the shell and the home read it.
export const vistas = [
  {
    ruta: "/tema",
    nombre: "Temas",
    descripcion: "Cómo votó cada grupo en el Congreso en cada tema, votación a votación.",
  },
  {
    ruta: "/estadisticas",
    nombre: "Estadísticas",
    descripcion: "Prototipo de interfaz con datos simulados; no representa votaciones reales.",
  },
] as const;
