package org.example.prj_rest_control_almacen_hardware.Service;

import org.example.prj_rest_control_almacen_hardware.Model.Marca_Entity;

import java.util.List;
import java.util.Optional;

public interface Marca_Service {
    //CRUD
    List<Marca_Entity> findAll();
    Marca_Entity save(Marca_Entity marca);
    String deleteById(Long id);
    Optional<Marca_Entity> update(Long id, Marca_Entity marca);
    //Métodos específicos
    Optional<Marca_Entity> findById(Long id);
    Optional<Marca_Entity> findByNombre(String nombre);
}
