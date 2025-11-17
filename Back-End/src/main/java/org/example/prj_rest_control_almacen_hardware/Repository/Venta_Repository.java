package org.example.prj_rest_control_almacen_hardware.Repository;

import org.example.prj_rest_control_almacen_hardware.Model.Venta_Entity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface Venta_Repository extends JpaRepository<Venta_Entity, Integer> {
    List<Venta_Entity> findAll();
    Optional<Venta_Entity> findById(Integer id);
    List<Venta_Entity> findByEstado(Boolean estado);
    List<Venta_Entity> findByFecha(LocalDate fecha);

    @Query("SELECT v FROM Venta_Entity v WHERE v.idUsuario.id = :usuarioId")
    List<Venta_Entity> findByUsuarioId(@Param("usuarioId") Integer usuarioId);

    @Query("SELECT v FROM Venta_Entity v WHERE v.idCliente.id = :clienteId")
    List<Venta_Entity> findByClienteId(@Param("clienteId") Integer clienteId);

    @Query("SELECT v FROM Venta_Entity v WHERE v.fecha BETWEEN :fechaInicio AND :fechaFin")
    List<Venta_Entity> findByFechaBetween(@Param("fechaInicio") LocalDate fechaInicio, @Param("fechaFin") LocalDate fechaFin);

    @Query("SELECT v FROM Venta_Entity v WHERE v.estado = true")
    List<Venta_Entity> findByEstadoActivo();
}
