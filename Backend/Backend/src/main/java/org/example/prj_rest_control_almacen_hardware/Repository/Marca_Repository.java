package org.example.prj_rest_control_almacen_hardware.Repository;

import org.example.prj_rest_control_almacen_hardware.Model.Marca_Entity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface Marca_Repository extends JpaRepository<Marca_Entity, Long> {
    List<Marca_Entity> findAll();
    Optional<Marca_Entity> findById(Long id);
    Optional<Marca_Entity> findByNombre(String nombre);
}
