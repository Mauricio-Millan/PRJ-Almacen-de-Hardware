/**
 * Interface para la solicitud del endpoint unificado /movimientos/generar
 * Maneja los 4 tipos de movimientos: ABASTECIMIENTO, TRANSFERENCIA, AJUSTE, VENTA
 */
export interface MovimientoGenerarRequest {
  fecha: string; // Fecha en formato ISO (ejemplo: "2025-11-16T18:00:00Z")
  referencia: string; // Referencia del movimiento (ejemplo: "COMPRA-001")
  comentario: string; // Comentario descriptivo del movimiento
  idUsuario: number; // ID del usuario que realiza el movimiento
  idTipoAccion: number; // 1=ABASTECIMIENTO, 2=TRANSFERENCIA, 3=AJUSTE, 4=VENTA
  idProveedor?: number; // Requerido solo para ABASTECIMIENTO (Compra)
  idCliente?: number; // Requerido solo para VENTA
  lineas: LineaMovimientoRequest[]; // Array de líneas del movimiento
}

/**
 * Interface para las líneas de un movimiento
 * Los campos requeridos dependen del tipo de acción
 */
export interface LineaMovimientoRequest {
  // Para ABASTECIMIENTO (Compra) - Se crea nuevo lote
  idProducto?: number; // ID del producto
  cantidadLote?: number; // Cantidad del lote
  precioUnitario?: number; // Precio unitario del producto
  fechaExpiracion?: string; // Fecha de expiración (formato: "YYYY-MM-DD")

  // Para TRANSFERENCIA, AJUSTE, VENTA - Se usa lote existente
  idLoteExistente?: number; // ID del lote existente

  // Común para todos los tipos
  cantidadDelta: number; // Cambio en cantidad (positivo o negativo)
  idAlmacenOrigen?: number | null; // ID del almacén origen (null para ABASTECIMIENTO)
  idAlmacenDestino?: number | null; // ID del almacén destino (null para AJUSTE y VENTA)

  // Solo para VENTA
  precioVenta?: number; // Precio de venta del producto
}

/**
 * Interface para la respuesta del endpoint /movimientos/generar
 */
export interface MovimientoGenerarResponse {
  success: boolean;
  message: string;
  data?: any; // Objeto con los datos del movimiento creado
  error?: string; // Descripción del error si success es false
}
