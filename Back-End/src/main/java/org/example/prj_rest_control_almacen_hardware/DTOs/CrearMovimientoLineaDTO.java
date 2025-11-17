package org.example.prj_rest_control_almacen_hardware.DTOs;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CrearMovimientoLineaDTO {
    private Long idMovimiento;
    private Long idAlmacenOrigen;
    private Long idAlmacenDestino;
    private Long idLote;
    private Integer cantidadDelta;
    private BigDecimal precioVenta;
}

