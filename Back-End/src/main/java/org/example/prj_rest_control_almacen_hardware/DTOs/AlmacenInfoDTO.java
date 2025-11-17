package org.example.prj_rest_control_almacen_hardware.DTOs;

import lombok.Getter;
import lombok.Setter;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AlmacenInfoDTO {
    private Integer idAlmacen;
    private String nombreAlmacen;
    private String direccion;
    private String telefono;
}

