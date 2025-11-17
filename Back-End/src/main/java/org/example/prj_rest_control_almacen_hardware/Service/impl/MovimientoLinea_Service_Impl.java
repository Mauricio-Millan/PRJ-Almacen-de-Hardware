package org.example.prj_rest_control_almacen_hardware.Service.impl;

import org.example.prj_rest_control_almacen_hardware.Model.MovimientoLinea_Entity;
import org.example.prj_rest_control_almacen_hardware.Repository.MovimientoLinea_Repository;
import org.example.prj_rest_control_almacen_hardware.Service.MovimientoLinea_Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MovimientoLinea_Service_Impl implements MovimientoLinea_Service {
    @Autowired
    private MovimientoLinea_Repository movimientoLinea_Repository;

    @Override
    public List<MovimientoLinea_Entity> findAll() {
        return movimientoLinea_Repository.findAll();
    }

    @Override
    public MovimientoLinea_Entity save(MovimientoLinea_Entity movimientoLinea) {
        return movimientoLinea_Repository.save(movimientoLinea);
    }

    @Override
    public String deleteById(Long id) {
        movimientoLinea_Repository.deleteById(id);
        return "MovimientoLinea eliminado con éxito";
    }

    @Override
    public Optional<MovimientoLinea_Entity> update(Long id, MovimientoLinea_Entity movimientoLinea) {
        Optional<MovimientoLinea_Entity> movimientoLineaExistente = movimientoLinea_Repository.findById(id);

        if (movimientoLineaExistente.isPresent()) {
            MovimientoLinea_Entity movimientoLineaActualizado = movimientoLineaExistente.get();
            movimientoLineaActualizado.setIdMovimiento(movimientoLinea.getIdMovimiento());
            movimientoLineaActualizado.setIdAlmacenOrigen(movimientoLinea.getIdAlmacenOrigen());
            movimientoLineaActualizado.setIdAlmacenDestino(movimientoLinea.getIdAlmacenDestino());
            movimientoLineaActualizado.setIdLote(movimientoLinea.getIdLote());
            movimientoLineaActualizado.setCantidadDelta(movimientoLinea.getCantidadDelta());
            movimientoLineaActualizado.setPrecioVenta(movimientoLinea.getPrecioVenta());

            return Optional.of(movimientoLinea_Repository.save(movimientoLineaActualizado));
        }
        return Optional.empty();
    }

    @Override
    public Optional<MovimientoLinea_Entity> findById(Long id) {
        return movimientoLinea_Repository.findById(id);
    }
}
