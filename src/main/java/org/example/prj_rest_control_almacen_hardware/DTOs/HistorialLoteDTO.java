package org.example.prj_rest_control_almacen_hardware.DTOs;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class HistorialLoteDTO {
    private InfoLoteDTO infoLote;
    private List<MovimientoDetalleDTO> historialMovimientos;
    private List<UbicacionStockDTO> ubicacionesActuales;
    private BalanceMovimientosDTO balance;
}

