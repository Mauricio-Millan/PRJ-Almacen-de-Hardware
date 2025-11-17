package org.example.prj_rest_control_almacen_hardware.Service.impl;

import org.example.prj_rest_control_almacen_hardware.Model.Marca_Entity;
import org.example.prj_rest_control_almacen_hardware.Repository.Marca_Repository;
import org.example.prj_rest_control_almacen_hardware.Service.Marca_Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class Marca_Service_Impl implements Marca_Service {
    @Autowired
    private Marca_Repository marca_Repository;

    @Override
    public List<Marca_Entity> findAll() {
        return marca_Repository.findAll();
    }

    @Override
    public Marca_Entity save(Marca_Entity marca) {
        return marca_Repository.save(marca);
    }

    @Override
    public String deleteById(Long id) {
        marca_Repository.deleteById(id);
        return "Marca eliminada con éxito";
    }

    @Override
    public Optional<Marca_Entity> update(Long id, Marca_Entity marca) {
        Optional<Marca_Entity> marcaExistente = marca_Repository.findById(id);

        if (marcaExistente.isPresent()) {
            Marca_Entity marcaActualizada = marcaExistente.get();
            marcaActualizada.setNombre(marca.getNombre());
            marcaActualizada.setEstado(marca.getEstado());

            return Optional.of(marca_Repository.save(marcaActualizada));
        }
        return Optional.empty();
    }

    @Override
    public Optional<Marca_Entity> findById(Long id) {
        return marca_Repository.findById(id);
    }

    @Override
    public Optional<Marca_Entity> findByNombre(String nombre) {
        return marca_Repository.findByNombre(nombre);
    }
}
