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
    private Producto_Repository producto_repo;

    @Override
    public List<Producto_Entity> findAll() {
        return producto_repo.findAll();
    }

    @Override
    public Producto_Entity save(Producto_Entity producto) {
        return producto_repo.save(producto);
    }

    @Override
    public String deleteById(Integer id) {
        producto_repo.deleteById(id);
        return "Producto eliminado con éxito";
    }

    @Override
    public Optional<Producto_Entity> update(Integer id, Producto_Entity producto) {
        Optional<Producto_Entity> productoExistente = producto_repo.findById(id);

        if (productoExistente.isPresent()) {
            Producto_Entity productoActualizado = productoExistente.get();
            productoActualizado.setNombre(producto.getNombre());
            productoActualizado.setIdMarca(producto.getIdMarca());
            productoActualizado.setEstado(producto.getEstado());

            return Optional.of(producto_repo.save(productoActualizado));
        }
        return Optional.empty();
    }

    @Override
    public Optional<Producto_Entity> findById(Integer id) {
        return producto_repo.findById(id);
    }

    @Override
    public Optional<Producto_Entity> findByNombre(String nombre) {
        return producto_repo.findByNombre(nombre);
    }

    @Override
    public List<Producto_Entity> findByEstado(Boolean estado) {
        return producto_repo.findByEstado(estado);
    }

    @Override
    public List<Producto_Entity> findByMarcaId(Integer marcaId) {
        return producto_repo.findByMarcaId(marcaId);
    }

    @Override
    public List<Producto_Entity> findByEstadoActivo() {
        return producto_repo.findByEstadoActivo();
    }
}
