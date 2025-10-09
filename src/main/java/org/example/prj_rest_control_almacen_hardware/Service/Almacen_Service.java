package org.example.prj_rest_control_almacen_hardware.Service;

import org.example.prj_rest_control_almacen_hardware.Model.Almacen_Entity;

import java.util.List;
import java.util.Optional;

public interface Almacen_Service {
    //CRUD
    List<Almacen_Entity> findAll();
    Almacen_Entity save(Almacen_Entity almacen);
    String deleteById(Long id);
    Optional<Almacen_Entity> update(Long id, Almacen_Entity almacen);
    //Métodos específicos
    Optional<Almacen_Entity> findById(Long id);
    Optional<Almacen_Entity> findByNombre(String nombre);
}
