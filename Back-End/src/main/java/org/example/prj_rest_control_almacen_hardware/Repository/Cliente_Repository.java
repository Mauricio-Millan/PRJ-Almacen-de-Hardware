package org.example.prj_rest_control_almacen_hardware.Repository;


import org.example.prj_rest_control_almacen_hardware.Model.Cliente_Entity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface Cliente_Repository extends JpaRepository<Cliente_Entity, Long> {
    List<Cliente_Entity> findAll();
    Optional<Cliente_Entity> findById(Long id);
    Optional<Cliente_Entity> findByRuc(String ruc);
}
