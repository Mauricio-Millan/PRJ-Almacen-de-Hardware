package org.example.prj_rest_control_almacen_hardware.DTOs;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

/**
 * DTO para generar un movimiento completo con múltiples líneas
 * Tipos de Acción:
 * 1 = Abastecimiento (Compra)
 * 2 = Transferencia
 * 3 = Ajuste
 * 4 = Venta
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GenerarMovimientoDTO {
    // Datos del Movimiento (cabecera)
    private Instant fecha;
    private String referencia;
    private String comentario;
    private Long idUsuario;
    private Long idTipoAccion; // 1=Abastecimiento, 2=Transferencia, 3=Ajuste, 4=Venta

    // Datos específicos según tipo de movimiento
    private Long idProveedor; // Para abastecimientos (compras)
    private Long idCliente;   // Para ventas

    // Lista de líneas de movimiento (productos/lotes)
    private List<LineaMovimientoDTO> lineas;
}

