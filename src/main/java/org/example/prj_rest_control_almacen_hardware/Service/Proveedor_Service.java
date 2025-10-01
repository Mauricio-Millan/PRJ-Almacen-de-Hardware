package org.example.prj_rest_control_almacen_hardware.Service;

import org.example.prj_rest_control_almacen_hardware.Model.Proveedor_Entity;

import java.util.List;
import java.util.Optional;

public interface Proveedor_Service {
    //CRUD
    List<Proveedor_Entity> findAll();
    Proveedor_Entity save(Proveedor_Entity proveedor);
    String deleteById(Long id);
    Optional<Proveedor_Entity> update(Long id, Proveedor_Entity proveedor);
    //Métodos específicos
    Optional<Proveedor_Entity> findById(Long id);
    Optional<Proveedor_Entity> findByRuc(String ruc);
}
