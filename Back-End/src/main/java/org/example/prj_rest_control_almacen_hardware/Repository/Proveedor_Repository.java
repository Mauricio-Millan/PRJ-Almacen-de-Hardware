package org.example.prj_rest_control_almacen_hardware.Repository;

import org.example.prj_rest_control_almacen_hardware.Model.Proveedor_Entity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface Proveedor_Repository extends JpaRepository<Proveedor_Entity, Long> {
    List<Proveedor_Entity> findAll();
    Optional<Proveedor_Entity> findById(Long id);
    Optional<Proveedor_Entity> findByRuc(String ruc);
}
