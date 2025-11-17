export interface Lote {
  id?: number;
  idCompra: {
    id: number;
  };
  cantidad: number;
  precioUnit: number;
  fechaExpiracion: string;
  estado: boolean;
  idProducto: {
    id: number;
  };
}
