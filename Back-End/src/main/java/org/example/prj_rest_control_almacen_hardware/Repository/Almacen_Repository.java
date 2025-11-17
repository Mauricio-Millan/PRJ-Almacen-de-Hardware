package org.example.prj_rest_control_almacen_hardware.Repository;

import org.example.prj_rest_control_almacen_hardware.Model.Almacen_Entity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface Almacen_Repository extends JpaRepository<Almacen_Entity, Long> {
    List<Almacen_Entity> findAll();
    Optional<Almacen_Entity> findById(Long id);
    Optional<Almacen_Entity> findByNombre(String nombre);
}
