package org.example.prj_rest_control_almacen_hardware.Repository;

import org.example.prj_rest_control_almacen_hardware.Model.Movimiento_Entity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface Movimiento_Repository extends JpaRepository<Movimiento_Entity, Long> {
    List<Movimiento_Entity> findAll();
    Optional<Movimiento_Entity> findById(Long id);
}
