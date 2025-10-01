package org.example.prj_rest_control_almacen_hardware.Service.impl;

import org.example.prj_rest_control_almacen_hardware.Model.Compra_Entity;
import org.example.prj_rest_control_almacen_hardware.Repository.Compra_Repository;
import org.example.prj_rest_control_almacen_hardware.Service.Compra_Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class Compra_Service_Impl implements Compra_Service {
    @Autowired
    private Compra_Repository compra_Repository;

    @Override
    public List<Compra_Entity> findAll() {
        return compra_Repository.findAll();
    }

    @Override
    public Compra_Entity save(Compra_Entity compra) {
        return compra_Repository.save(compra);
    }

    @Override
    public String deleteById(Long id) {
        compra_Repository.deleteById(id);
        return "Compra eliminada con éxito";
    }

    @Override
    public Optional<Compra_Entity> update(Long id, Compra_Entity compra) {
        Optional<Compra_Entity> compraExistente = compra_Repository.findById(id);

        if (compraExistente.isPresent()) {
            Compra_Entity compraActualizada = compraExistente.get();
            compraActualizada.setIdUsuario(compra.getIdUsuario());
            compraActualizada.setIdMovimiento(compra.getIdMovimiento());
            compraActualizada.setIdProveedor(compra.getIdProveedor());
            compraActualizada.setFecha(compra.getFecha());

            return Optional.of(compra_Repository.save(compraActualizada));
        }
        return Optional.empty();
    }

    @Override
    public Optional<Compra_Entity> findById(Long id) {
        return compra_Repository.findById(id);
    }
}
