package org.example.prj_rest_control_almacen_hardware.Service.impl;

import org.example.prj_rest_control_almacen_hardware.Model.Movimiento_Entity;
import org.example.prj_rest_control_almacen_hardware.Repository.Movimiento_Repository;
import org.example.prj_rest_control_almacen_hardware.Service.Movimiento_Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class Movimiento_Service_Impl implements Movimiento_Service {
    @Autowired
    private Movimiento_Repository movimiento_Repository;

    @Override
    public List<Movimiento_Entity> findAll() {
        return movimiento_Repository.findAll();
    }

    @Override
    public Movimiento_Entity save(Movimiento_Entity movimiento) {
        return movimiento_Repository.save(movimiento);
    }

    @Override
    public String deleteById(Long id) {
        movimiento_Repository.deleteById(id);
        return "Movimiento eliminado con éxito";
    }

    @Override
    public Optional<Movimiento_Entity> update(Long id, Movimiento_Entity movimiento) {
        Optional<Movimiento_Entity> movimientoExistente = movimiento_Repository.findById(id);

        if (movimientoExistente.isPresent()) {
            Movimiento_Entity movimientoActualizado = movimientoExistente.get();
            movimientoActualizado.setFecha(movimiento.getFecha());
            movimientoActualizado.setIdUsuario(movimiento.getIdUsuario());
            movimientoActualizado.setIdTipoAccion(movimiento.getIdTipoAccion());
            movimientoActualizado.setReferencia(movimiento.getReferencia());
            movimientoActualizado.setComentario(movimiento.getComentario());
            movimientoActualizado.setCreatedAt(movimiento.getCreatedAt());

            return Optional.of(movimiento_Repository.save(movimientoActualizado));
        }
        return Optional.empty();
    }

    @Override
    public Optional<Movimiento_Entity> findById(Long id) {
        return movimiento_Repository.findById(id);
    }
}
