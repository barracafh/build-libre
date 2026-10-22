// Datos ficticios para mostrar la UI. No representan estadísticas públicas.
export type PuntoEstadistico = { nombre: string; valor: number };
export type Indicador = {
  id: string;
  nombre: string;
  valor: number | null;
  descripcion: string;
};

// Una única matriz permite derivar indicadores, series y distribuciones coherentes.
const muestra = [
  { periodo: "Ene", valores: [80, 60, 40] },
  { periodo: "Feb", valores: [100, 80, 60] },
  { periodo: "Mar", valores: [90, 70, 50] },
  { periodo: "Abr", valores: [150, 100, 70] },
  { periodo: "May", valores: [120, 100, 60] },
  { periodo: "Jun", valores: [180, 130, 80] },
];

export const evolucion: PuntoEstadistico[] = muestra.map(({ periodo, valores }) => ({
  nombre: periodo,
  valor: valores.reduce((total, valor) => total + valor, 0),
}));

export const distribucion: PuntoEstadistico[] = ["Grupo A", "Grupo B", "Grupo C"].map((nombre, index) => ({
  nombre,
  valor: muestra.reduce((total, fila) => total + fila.valores[index], 0),
}));

const total = evolucion.reduce((suma, punto) => suma + punto.valor, 0);

export const indicadores: readonly Indicador[] = [
  { id: "registros", nombre: "Total de registros", valor: total, descripcion: "Acumulado de la muestra ficticia." },
  { id: "media", nombre: "Media por periodo", valor: total / evolucion.length, descripcion: "Registros por mes de la muestra." },
  { id: "categorias", nombre: "Categorías", valor: distribucion.length, descripcion: "Grupos de ejemplo para comparar." },
  { id: "periodos", nombre: "Periodos", valor: evolucion.length, descripcion: "Meses incluidos en la demostración." },
];
