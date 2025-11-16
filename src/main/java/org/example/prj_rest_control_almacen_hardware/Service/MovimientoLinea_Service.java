package org.example.prj_rest_control_almacen_hardware.Service;

import org.example.prj_rest_control_almacen_hardware.DTOs.CrearMovimientoLineaDTO;
import org.example.prj_rest_control_almacen_hardware.Model.MovimientoLinea_Entity;

import java.util.List;
import java.util.Optional;

public interface MovimientoLinea_Service {
    //CRUD
    List<MovimientoLinea_Entity> findAll();
    MovimientoLinea_Entity save(MovimientoLinea_Entity movimientoLinea);
    String deleteById(Long id);
    Optional<MovimientoLinea_Entity> update(Long id, MovimientoLinea_Entity movimientoLinea);
    //Métodos específicos
    Optional<MovimientoLinea_Entity> findById(Long id);

    // Método para crear desde DTO con IDs
    MovimientoLinea_Entity crearDesdeDTO(CrearMovimientoLineaDTO dto) throws Exception;
}
