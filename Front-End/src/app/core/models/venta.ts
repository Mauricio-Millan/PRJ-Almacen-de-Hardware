export interface Venta {
  id?: number;
  fecha?: string;
  estado?: boolean;
  idUsuario?: number | { id: number };  // Puede ser número o objeto
  idCliente?: number | { id: number };  // Puede ser número o objeto
  idMovimiento?: number | { id: number };  // Puede ser número o objeto
  referencia?: string;
  comentario?: string;
}
