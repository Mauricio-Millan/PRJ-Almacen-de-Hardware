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
public class ResumenUsuarioDTO {
    private Integer totalMovimientos;
    private Integer totalAbastecimientos;
    private Integer totalTraslados;
    private Integer totalAjustes;
    private Integer totalVentas;
    private Integer totalUnidadesAbastecidas;
    private Integer totalUnidadesTrasladadas;
    private Integer totalUnidadesVendidas;
    private BigDecimal totalIngresosVentas;
    private String primeraAccion;
    private String ultimaAccion;
}

