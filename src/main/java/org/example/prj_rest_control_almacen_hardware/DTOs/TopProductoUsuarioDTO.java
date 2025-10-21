package org.example.prj_rest_control_almacen_hardware.DTOs;

import lombok.Getter;
import lombok.Setter;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class TopProductoUsuarioDTO {
    private Integer idProducto;
    private String nombreProducto;
    private String marca;
    private Integer cantidadMovimientos;
    private Integer totalUnidadesManejadas;
}

