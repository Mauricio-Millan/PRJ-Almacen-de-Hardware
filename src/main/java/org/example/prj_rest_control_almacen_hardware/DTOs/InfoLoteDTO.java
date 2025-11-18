package org.example.prj_rest_control_almacen_hardware.DTOs;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class InfoLoteDTO {
    private Long idLote;
    private String producto;
    private Long idProducto;
    private String marca;
    private BigDecimal precioUnit;
    private LocalDate fechaExpiracion;
    private String fechaExpiracionFormato;
    private Integer cantidadOriginal;
    private Long idCompra;
    private LocalDate fechaCompra;
    private String fechaCompraFormato;
    private String proveedor;
}

