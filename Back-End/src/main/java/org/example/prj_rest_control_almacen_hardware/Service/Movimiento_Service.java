package org.example.prj_rest_control_almacen_hardware.Service;

import org.example.prj_rest_control_almacen_hardware.DTOs.GenerarMovimientoDTO;
import org.example.prj_rest_control_almacen_hardware.Model.Movimiento_Entity;

import java.util.List;
import java.util.Optional;

public interface Movimiento_Service {
    //CRUD
    List<Movimiento_Entity> findAll();
    Movimiento_Entity save(Movimiento_Entity movimiento);
    String deleteById(Long id);
    Optional<Movimiento_Entity> update(Long id, Movimiento_Entity movimiento);
    //Métodos específicos
    Optional<Movimiento_Entity> findById(Long id);

    // Método de generación de movimientos
    Movimiento_Entity generarMovimiento(GenerarMovimientoDTO dto) throws Exception;
}
