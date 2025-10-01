package org.example.prj_rest_control_almacen_hardware.Service.impl;

import org.example.prj_rest_control_almacen_hardware.Model.Lote_Entity;
import org.example.prj_rest_control_almacen_hardware.Repository.Lote_Repository;
import org.example.prj_rest_control_almacen_hardware.Service.Lote_Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class Lote_Service_Impl implements Lote_Service {
    @Autowired
    private Lote_Repository lote_Repository;

    @Override
    public List<Lote_Entity> findAll() {
        return lote_Repository.findAll();
    }

    @Override
    public Lote_Entity save(Lote_Entity lote) {
        return lote_Repository.save(lote);
    }

    @Override
    public String deleteById(Long id) {
        lote_Repository.deleteById(id);
        return "Lote eliminado con éxito";
    }

    @Override
    public Optional<Lote_Entity> update(Long id, Lote_Entity lote) {
        Optional<Lote_Entity> loteExistente = lote_Repository.findById(id);

        if (loteExistente.isPresent()) {
            Lote_Entity loteActualizado = loteExistente.get();
            loteActualizado.setIdProducto(lote.getIdProducto());
            loteActualizado.setIdCompra(lote.getIdCompra());
            loteActualizado.setCantidad(lote.getCantidad());
            loteActualizado.setPrecioUnit(lote.getPrecioUnit());
            loteActualizado.setFechaExpiracion(lote.getFechaExpiracion());

            return Optional.of(lote_Repository.save(loteActualizado));
        }
        return Optional.empty();
    }

    @Override
    public Optional<Lote_Entity> findById(Long id) {
        return lote_Repository.findById(id);
    }
}
