export interface Compra {
  id?: number;
  fecha?: string;
  estado?: boolean;
  idUsuario?: number | { id: number };  // Puede ser número o objeto
  idProveedor?: number | { id: number };
  idMovimiento?: number | { id: number };
}
