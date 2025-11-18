package org.example.prj_rest_control_almacen_hardware.Repository;

import org.example.prj_rest_control_almacen_hardware.Model.MovimientoLinea_Entity;
import org.example.prj_rest_control_almacen_hardware.Model.Movimiento_Entity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MovimientoLinea_Repository extends JpaRepository<MovimientoLinea_Entity, Long> {
    List<MovimientoLinea_Entity> findAll();
    Optional<MovimientoLinea_Entity> findById(Long id);
    List<MovimientoLinea_Entity> findByIdMovimiento(Movimiento_Entity movimiento);
    List<MovimientoLinea_Entity> findByIdMovimiento_Id(Long idMovimiento);
}
