// Modelo basado en las recomendaciones del backend
export interface MovimientoLinea {
  id?: number;
  idMovimiento: { id: number };
  idAlmacenOrigen?: { id: number } | null;
  idAlmacenDestino?: { id: number } | null;
  idLote: {
    id: number;
    codigoLote?: string;
    idProducto: {
      id: number;
      nombre: string;
      idMarca: {
        id: number;
        nombre: string;
        estado: boolean;
      };
      estado: boolean;
    };
    cantidad: number;
    precioUnit: number;
    fechaExpiracion: string;
    estado: boolean;
  };
  cantidadDelta: number;
  precioVenta?: number | null;
}
