package org.example.prj_rest_control_almacen_hardware.Service;

import org.example.prj_rest_control_almacen_hardware.Model.Usuario_Entity;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface Usuario_Service {
    //CRUD
List<Usuario_Entity> findAll();
Usuario_Entity save(Usuario_Entity usuario);
String deleteById(Long id);
Optional<Usuario_Entity> update(Long id, Usuario_Entity usuario);
//Metodos especificos
Optional<Usuario_Entity> findById(Long id);
Optional<Usuario_Entity> findByDni(String dni);
//Login
Optional<Usuario_Entity> Login(Usuario_Entity usuario);
}
