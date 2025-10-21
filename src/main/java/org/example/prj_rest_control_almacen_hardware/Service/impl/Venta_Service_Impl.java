package org.example.prj_rest_control_almacen_hardware.Service.impl;

import org.example.prj_rest_control_almacen_hardware.Model.Venta_Entity;
import org.example.prj_rest_control_almacen_hardware.Repository.Venta_Repository;
import org.example.prj_rest_control_almacen_hardware.Service.Venta_Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class Venta_Service_Impl implements Venta_Service {
    @Autowired
    private Venta_Repository venta_repo;

    @Override
    public List<Venta_Entity> findAll() {
        return venta_repo.findAll();
    }

    @Override
    public Venta_Entity save(Venta_Entity venta) {
        return venta_repo.save(venta);
    }

    @Override
    public String deleteById(Integer id) {
        venta_repo.deleteById(id);
        return "Venta eliminada con éxito";
    }

    @Override
    public Optional<Venta_Entity> update(Integer id, Venta_Entity venta) {
        Optional<Venta_Entity> ventaExistente = venta_repo.findById(id);

        if (ventaExistente.isPresent()) {
            Venta_Entity ventaActualizada = ventaExistente.get();
            ventaActualizada.setIdUsuario(venta.getIdUsuario());
            ventaActualizada.setIdMovimiento(venta.getIdMovimiento());
            ventaActualizada.setIdCliente(venta.getIdCliente());
            ventaActualizada.setFecha(venta.getFecha());
            ventaActualizada.setEstado(venta.getEstado());

            return Optional.of(venta_repo.save(ventaActualizada));
        }
        return Optional.empty();
    }

    @Override
    public Optional<Venta_Entity> findById(Integer id) {
        return venta_repo.findById(id);
    }

    @Override
    public List<Venta_Entity> findByEstado(Boolean estado) {
        return venta_repo.findByEstado(estado);
    }

    @Override
    public List<Venta_Entity> findByFecha(LocalDate fecha) {
        return venta_repo.findByFecha(fecha);
    }

    @Override
    public List<Venta_Entity> findByUsuarioId(Integer usuarioId) {
        return venta_repo.findByUsuarioId(usuarioId);
    }

    @Override
    public List<Venta_Entity> findByClienteId(Integer clienteId) {
        return venta_repo.findByClienteId(clienteId);
    }

    @Override
    public List<Venta_Entity> findByFechaBetween(LocalDate fechaInicio, LocalDate fechaFin) {
        return venta_repo.findByFechaBetween(fechaInicio, fechaFin);
    }

    @Override
    public List<Venta_Entity> findByEstadoActivo() {
        return venta_repo.findByEstadoActivo();
    }
}
