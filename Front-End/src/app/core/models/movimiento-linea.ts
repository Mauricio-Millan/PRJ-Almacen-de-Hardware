// Modelo basado en las recomendaciones del backend
export interface MovimientoLinea {
  id?: number;
  idMovimiento: { id: number };
  idAlmacenOrigen?: { id: number } | null;
  idAlmacenDestino?: { id: number } | null;
  idLote: { id: number };
  cantidadDelta: number;
  precioVenta?: number | null;
}
