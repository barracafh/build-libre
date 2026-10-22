// The site's views, in menu order. Adding a view = one line here; the shell and the home read it.
export const vistas = [
  {
    ruta: "/posturas",
    nombre: "Temas",
    descripcion: "Elige un tema y consulta sus iniciativas, votos, medidas e intervenciones en un mismo lugar.",
  },
  {
    ruta: "/escaner",
    nombre: "Programas y votos",
    descripcion: "Los programas de 2023 de PP, PSOE, Sumar y Vox frente a lo que votaron después en el Pleno.",
  },
] as const;
