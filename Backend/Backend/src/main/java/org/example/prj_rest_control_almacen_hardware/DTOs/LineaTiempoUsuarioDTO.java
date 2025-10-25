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
public class LineaTiempoUsuarioDTO {
    private UsuarioInfoDTO informacionUsuario;
    private List<LineaTiempoDetalleDTO> lineaTiempo;
    private ResumenUsuarioDTO resumen;
    private List<TopProductoUsuarioDTO> topProductos;
    private List<AlmacenUtilizadoDTO> almacenesUtilizados;
}

