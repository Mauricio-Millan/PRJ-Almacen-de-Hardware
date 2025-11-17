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
public class DetalleProductoDTO {
    private Integer idContenidoAlmacen;
    private Integer idProducto;
    private String nombreProducto;
    private String marca;
    private Integer numeroLote;
    private BigDecimal precioUnitario;
    private String fechaExpiracion;
    private Integer cantidadLote;
    private Integer stockActual;
    private String estadoStock;
}

