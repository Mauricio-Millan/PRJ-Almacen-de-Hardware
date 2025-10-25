package org.example.prj_rest_control_almacen_hardware.Service;

import org.example.prj_rest_control_almacen_hardware.Model.Roles_Entity;

import java.util.List;
import java.util.Optional;

public interface Roles_Service {
    //CRUD
    List<Roles_Entity> findAll();
    Roles_Entity save(Roles_Entity rol);
    String deleteById(Integer id);
    Optional<Roles_Entity> update(Integer id, Roles_Entity rol);

    //Métodos específicos
    Optional<Roles_Entity> findById(Integer id);
    Optional<Roles_Entity> findByNombre(String nombre);
    List<Roles_Entity> findByEstado(Boolean estado);
    List<Roles_Entity> findByEstadoActivo();
}
