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
public class ResumenAlmacenDTO {
    private Integer totalProductosDistintos;
    private Integer totalLotes;
    private Integer totalUnidades;
    private BigDecimal valorTotalInventario;
    private Integer lotesSinStock;
    private Integer lotesConStock;
}

