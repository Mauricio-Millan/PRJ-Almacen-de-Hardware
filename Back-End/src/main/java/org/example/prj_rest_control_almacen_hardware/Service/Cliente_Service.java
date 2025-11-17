package org.example.prj_rest_control_almacen_hardware.Service;

import org.example.prj_rest_control_almacen_hardware.Model.Cliente_Entity;

import java.util.List;
import java.util.Optional;

public interface Cliente_Service {
    //CRUD
    List<Cliente_Entity> findAll();
    Cliente_Entity save(Cliente_Entity cliente);
    String deleteById(Long id);
    Optional<Cliente_Entity> update(Long id, Cliente_Entity cliente);
    //Métodos específicos
    Optional<Cliente_Entity> findById(Long id);
    Optional<Cliente_Entity> findByRuc(String ruc);
}
