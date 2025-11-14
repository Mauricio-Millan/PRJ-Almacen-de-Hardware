export interface Movimiento {
  id: number;
  tipo: string;        // 'ENTRADA' | 'SALIDA' | 'TRANSFERENCIA'
  idProducto: number;
  cantidad: number;
  fecha: string;       // ISO string
  descripcion?: string;
  idUsuario: number;
}
