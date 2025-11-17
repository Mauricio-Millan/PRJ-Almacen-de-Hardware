package org.example.prj_rest_control_almacen_hardware.DTOs;

import lombok.Getter;
import lombok.Setter;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class LineaTiempoDetalleDTO {
    private Integer idMovimiento;
    private String fechaHora;
    private Integer idTipoAccion;
    private String tipoAccion;
    private String referencia;
    private String comentario;
    private Integer idMovimientoLinea;
    private Integer cantidad;
    private BigDecimal precioVenta;
    private Integer idLote;
    private Integer idProducto;
    private String nombreProducto;
    private String marca;
    private BigDecimal precioUnitarioLote;
    private Integer idAlmacenOrigen;
    private String almacenOrigen;
    private Integer idAlmacenDestino;
    private String almacenDestino;
    private String descripcionAccion;
    private String fechaRegistro;
    private String tipoFlujo;
}

