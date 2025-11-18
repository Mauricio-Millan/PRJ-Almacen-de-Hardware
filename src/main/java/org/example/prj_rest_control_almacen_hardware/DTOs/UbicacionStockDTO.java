package org.example.prj_rest_control_almacen_hardware.DTOs;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UbicacionStockDTO {
    private Long idAlmacen;
    private String almacen;
    private Integer stockActual;
    private BigDecimal valorTotal;
    private String estadoStock;
}

