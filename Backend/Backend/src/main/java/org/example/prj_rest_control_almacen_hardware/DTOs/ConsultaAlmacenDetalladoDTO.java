package org.example.prj_rest_control_almacen_hardware.DTOs;

import lombok.Getter;
import lombok.Setter;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ConsultaAlmacenDetalladoDTO {
    private AlmacenInfoDTO informacion;
    private List<DetalleProductoDTO> productos;
    private ResumenAlmacenDTO resumen;
}

