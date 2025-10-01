package org.example.prj_rest_control_almacen_hardware.Repository;

import org.example.prj_rest_control_almacen_hardware.Model.Lote_Entity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface Lote_Repository extends JpaRepository<Lote_Entity, Long> {
    List<Lote_Entity> findAll();
    Optional<Lote_Entity> findById(Long id);
}
