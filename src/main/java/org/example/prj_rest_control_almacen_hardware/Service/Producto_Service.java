package org.example.prj_rest_control_almacen_hardware.Service;

import org.example.prj_rest_control_almacen_hardware.Model.Producto_Entity;

import java.util.List;
import java.util.Optional;

public interface Producto_Service {
    //CRUD
    List<Producto_Entity> findAll();
    Producto_Entity save(Producto_Entity producto);
    String deleteById(Long id);
    Optional<Producto_Entity> update(Long id, Producto_Entity producto);
    //Métodos específicos
    Optional<Producto_Entity> findById(Long id);
    Optional<Producto_Entity> findByNombre(String nombre);
}
