package org.example.prj_rest_control_almacen_hardware.Service;

import org.example.prj_rest_control_almacen_hardware.Model.Venta_Entity;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface Venta_Service {
    //CRUD
    List<Venta_Entity> findAll();
    Venta_Entity save(Venta_Entity venta);
    String deleteById(Integer id);
    Optional<Venta_Entity> update(Integer id, Venta_Entity venta);

    //Métodos específicos
    Optional<Venta_Entity> findById(Integer id);
    List<Venta_Entity> findByEstado(Boolean estado);
    List<Venta_Entity> findByFecha(LocalDate fecha);
    List<Venta_Entity> findByUsuarioId(Integer usuarioId);
    List<Venta_Entity> findByClienteId(Integer clienteId);
    List<Venta_Entity> findByFechaBetween(LocalDate fechaInicio, LocalDate fechaFin);
    List<Venta_Entity> findByEstadoActivo();
}
