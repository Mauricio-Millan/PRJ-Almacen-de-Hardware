package org.example.prj_rest_control_almacen_hardware.Service.impl;

import org.example.prj_rest_control_almacen_hardware.Model.Proveedor_Entity;
import org.example.prj_rest_control_almacen_hardware.Repository.Proveedor_Repository;
import org.example.prj_rest_control_almacen_hardware.Service.Proveedor_Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class Proveedor_Service_Impl implements Proveedor_Service {
    @Autowired
    private Proveedor_Repository proveedor_Repository;

    @Override
    public List<Proveedor_Entity> findAll() {
        return proveedor_Repository.findAll();
    }

    @Override
    public Proveedor_Entity save(Proveedor_Entity proveedor) {
        return proveedor_Repository.save(proveedor);
    }

    @Override
    public String deleteById(Long id) {
        proveedor_Repository.deleteById(id);
        return "Proveedor eliminado con éxito";
    }

    @Override
    public Optional<Proveedor_Entity> update(Long id, Proveedor_Entity proveedor) {
        Optional<Proveedor_Entity> proveedorExistente = proveedor_Repository.findById(id);

        if (proveedorExistente.isPresent()) {
            Proveedor_Entity proveedorActualizado = proveedorExistente.get();
            proveedorActualizado.setNombre(proveedor.getNombre());
            proveedorActualizado.setRuc(proveedor.getRuc());
            proveedorActualizado.setTelefono(proveedor.getTelefono());
            proveedorActualizado.setEstado(proveedor.getEstado());
            return Optional.of(proveedor_Repository.save(proveedorActualizado));
        }
        return Optional.empty();
    }

    @Override
    public Optional<Proveedor_Entity> findById(Long id) {
        return proveedor_Repository.findById(id);
    }

    @Override
    public Optional<Proveedor_Entity> findByRuc(String ruc) {
        return proveedor_Repository.findByRuc(ruc);
    }
}
