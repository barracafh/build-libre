import {
  Table, TableBody, TableCaption, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import type { PuntoEstadistico } from "@/datos/estadisticas";

const formatoNumero = new Intl.NumberFormat("es-ES");

export function TablaEstadistica({ datos, titulo, columna }: {
  datos: readonly PuntoEstadistico[];
  titulo: string;
  columna: string;
}) {
  return (
    <Table className="table-fixed">
      <TableCaption>{titulo} · Datos simulados.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead scope="col">{columna}</TableHead>
          <TableHead scope="col" className="text-right">Registros</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {datos.map((punto) => (
          <TableRow key={punto.nombre}>
            <TableHead scope="row" className="font-normal">{punto.nombre}</TableHead>
            <TableCell className="text-right font-mono tabular-nums">{formatoNumero.format(punto.valor)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
