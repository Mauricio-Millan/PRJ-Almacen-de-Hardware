package org.example.prj_rest_control_almacen_hardware.DTOs;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO para representar una línea de movimiento (producto/lote individual)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LineaMovimientoDTO {
    // Para ABASTECIMIENTO (Compra)
    private Long idProducto;
    private Integer cantidadLote;
    private BigDecimal precioUnitario;
    private LocalDate fechaExpiracion;

    // Para VENTA y TRANSFERENCIA (usan lote existente)
    private Long idLoteExistente;

    // Para todas las operaciones
    private Integer cantidadDelta;
    private Long idAlmacenOrigen;  // null en abastecimientos
    private Long idAlmacenDestino; // null en ventas
    private BigDecimal precioVenta; // Solo para ventas
}

