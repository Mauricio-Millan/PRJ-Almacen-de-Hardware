export interface Venta {
  id?: number;
  fecha: string;
  estado: boolean;
  idUsuario: number;
  idCliente: number;
  idMovimiento: number;
}
