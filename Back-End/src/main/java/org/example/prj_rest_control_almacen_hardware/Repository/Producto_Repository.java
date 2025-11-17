package org.example.prj_rest_control_almacen_hardware.Repository;

import org.example.prj_rest_control_almacen_hardware.Model.Producto_Entity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface Producto_Repository extends JpaRepository<Producto_Entity, Integer> {
    List<Producto_Entity> findAll();
    Optional<Producto_Entity> findById(Integer id);
    List<Producto_Entity> findByEstado(Boolean estado);
    Optional<Producto_Entity> findByNombre(String nombre);

    @Query("SELECT p FROM Producto_Entity p WHERE p.idMarca.id = :marcaId")
    List<Producto_Entity> findByMarcaId(@Param("marcaId") Integer marcaId);

    @Query("SELECT p FROM Producto_Entity p WHERE p.estado = true")
    List<Producto_Entity> findByEstadoActivo();
}
