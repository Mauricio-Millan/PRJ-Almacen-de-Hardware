package org.example.prj_rest_control_almacen_hardware.DTOs;

import lombok.Getter;
import lombok.Setter;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AlmacenUtilizadoDTO {
    private Integer idAlmacen;
    private String nombreAlmacen;
    private Integer cantidadOperaciones;
    private Integer operacionesComoOrigen;
    private Integer operacionesComoDestino;
}

