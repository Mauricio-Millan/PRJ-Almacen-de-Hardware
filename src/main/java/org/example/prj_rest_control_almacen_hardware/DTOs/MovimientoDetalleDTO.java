package org.example.prj_rest_control_almacen_hardware.DTOs;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MovimientoDetalleDTO {
    private Integer secuencia;
    private Long idMovimientoLinea;
    private Long idMovimiento;
    private LocalDateTime fechaMovimiento;
    private String fechaMovimientoFormato;
    private String tipoAccion;
    private Long idTipoAccion;
    private String usuario;
    private Long idUsuario;
    private Integer cantidadMovida;
    private Integer cantidadConSigno;
    private String almacenOrigen;
    private Long idAlmacenOrigen;
    private String almacenDestino;
    private Long idAlmacenDestino;
    private String tipoMovimiento;
    private String referencia;
    private String comentario;
    private LocalDateTime fechaRegistro;
    private String fechaRegistroFormato;
}

