package org.example.prj_rest_control_almacen_hardware.DTOs;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BalanceMovimientosDTO {
    private Integer totalEntradas;
    private Integer totalSalidas;
    private Integer totalAjustes;
    private Integer stockActual;
    private Integer balanceCalculado;
    private String estadoBalance;
}

