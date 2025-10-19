package org.example.prj_rest_control_almacen_hardware.Repository;

import org.example.prj_rest_control_almacen_hardware.Model.Compra_Entity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface Compra_Repository extends JpaRepository<Compra_Entity, Long> {
    List<Compra_Entity> findAll();
    Optional<Compra_Entity> findById(Long id);
    List<Compra_Entity> findByIdUsuarioId(Long idUsuario);
    List<Compra_Entity> findByIdProveedorId(Long idProveedor);
}
