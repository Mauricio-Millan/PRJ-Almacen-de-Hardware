package org.example.prj_rest_control_almacen_hardware.Repository;

import org.example.prj_rest_control_almacen_hardware.Model.Roles_Entity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface Roles_Repository extends JpaRepository<Roles_Entity, Integer> {
    List<Roles_Entity> findAll();
    Optional<Roles_Entity> findById(Integer id);
    Optional<Roles_Entity> findByNombre(String nombre);
    List<Roles_Entity> findByEstado(Boolean estado);

    @Query("SELECT r FROM Roles_Entity r WHERE r.estado = true")
    List<Roles_Entity> findByEstadoActivo();
}
