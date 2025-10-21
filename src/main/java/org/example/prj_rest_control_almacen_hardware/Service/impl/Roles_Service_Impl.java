package org.example.prj_rest_control_almacen_hardware.Service.impl;

import org.example.prj_rest_control_almacen_hardware.Model.Roles_Entity;
import org.example.prj_rest_control_almacen_hardware.Repository.Roles_Repository;
import org.example.prj_rest_control_almacen_hardware.Service.Roles_Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class Roles_Service_Impl implements Roles_Service {
    @Autowired
    private Roles_Repository roles_repo;

    @Override
    public List<Roles_Entity> findAll() {
        return roles_repo.findAll();
    }

    @Override
    public Roles_Entity save(Roles_Entity rol) {
        return roles_repo.save(rol);
    }

    @Override
    public String deleteById(Integer id) {
        roles_repo.deleteById(id);
        return "Rol eliminado con éxito";
    }

    @Override
    public Optional<Roles_Entity> update(Integer id, Roles_Entity rol) {
        Optional<Roles_Entity> rolExistente = roles_repo.findById(id);

        if (rolExistente.isPresent()) {
            Roles_Entity rolActualizado = rolExistente.get();
            rolActualizado.setNombre(rol.getNombre());
            rolActualizado.setEstado(rol.getEstado());

            return Optional.of(roles_repo.save(rolActualizado));
        }
        return Optional.empty();
    }

    @Override
    public Optional<Roles_Entity> findById(Integer id) {
        return roles_repo.findById(id);
    }

    @Override
    public Optional<Roles_Entity> findByNombre(String nombre) {
        return roles_repo.findByNombre(nombre);
    }

    @Override
    public List<Roles_Entity> findByEstado(Boolean estado) {
        return roles_repo.findByEstado(estado);
    }

    @Override
    public List<Roles_Entity> findByEstadoActivo() {
        return roles_repo.findByEstadoActivo();
    }
}
