package org.example.prj_rest_control_almacen_hardware.DTOs;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GenerarMovimientoDTO {
    // Datos del Movimiento
    private Instant fecha;
    private String referencia;
    private String comentario;
    private Long idUsuario;
    private Long idTipoAccion; // 1=Abastecimiento, 2=Venta, 3=Transferencia

    // Datos específicos según tipo de movimiento
    private Long idProveedor; // Para abastecimientos (compras)
    private Long idCliente;   // Para ventas

    // Datos del Lote (para abastecimientos)
    private Long idProducto;
    private Integer cantidadLote;
    private BigDecimal precioUnitario;
    private LocalDate fechaExpiracion;
    private Long idLoteExistente; // Para ventas/transferencias se usa un lote existente

    // Datos de MovimientoLinea
    private Long idAlmacenOrigen;  // null en abastecimientos
    private Long idAlmacenDestino; // null en ventas
    private Integer cantidadDelta;
    private BigDecimal precioVenta; // Para ventas
}

