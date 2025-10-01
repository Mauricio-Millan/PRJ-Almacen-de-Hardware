package org.example.prj_rest_control_almacen_hardware.Repository;

import org.example.prj_rest_control_almacen_hardware.Model.Producto_Entity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface Producto_Repository extends JpaRepository<Producto_Entity, Long> {
    List<Producto_Entity> findAll();
    Optional<Producto_Entity> findById(Long id);
    Optional<Producto_Entity> findByNombre(String nombre);
}
