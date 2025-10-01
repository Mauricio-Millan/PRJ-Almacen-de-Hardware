package org.example.prj_rest_control_almacen_hardware.Service.impl;

import org.example.prj_rest_control_almacen_hardware.Model.Producto_Entity;
import org.example.prj_rest_control_almacen_hardware.Repository.Producto_Repository;
import org.example.prj_rest_control_almacen_hardware.Service.Producto_Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class Producto_Service_Impl implements Producto_Service {
    @Autowired
    private Producto_Repository producto_Repository;

    @Override
    public List<Producto_Entity> findAll() {
        return producto_Repository.findAll();
    }

    @Override
    public Producto_Entity save(Producto_Entity producto) {
        return producto_Repository.save(producto);
    }

    @Override
    public String deleteById(Long id) {
        producto_Repository.deleteById(id);
        return "Producto eliminado con éxito";
    }

    @Override
    public Optional<Producto_Entity> update(Long id, Producto_Entity producto) {
        Optional<Producto_Entity> productoExistente = producto_Repository.findById(id);

        if (productoExistente.isPresent()) {
            Producto_Entity productoActualizado = productoExistente.get();
            productoActualizado.setNombre(producto.getNombre());
            productoActualizado.setIdMarca(producto.getIdMarca());

            return Optional.of(producto_Repository.save(productoActualizado));
        }
        return Optional.empty();
    }

    @Override
    public Optional<Producto_Entity> findById(Long id) {
        return producto_Repository.findById(id);
    }

    @Override
    public Optional<Producto_Entity> findByNombre(String nombre) {
        return producto_Repository.findByNombre(nombre);
    }
}
