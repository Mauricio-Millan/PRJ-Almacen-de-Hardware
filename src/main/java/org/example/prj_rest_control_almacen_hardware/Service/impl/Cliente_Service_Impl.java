package org.example.prj_rest_control_almacen_hardware.Service.impl;

import org.example.prj_rest_control_almacen_hardware.Model.Cliente_Entity;
import org.example.prj_rest_control_almacen_hardware.Repository.Cliente_Repository;
import org.example.prj_rest_control_almacen_hardware.Service.Cliente_Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class Cliente_Service_Impl implements Cliente_Service {
    @Autowired
    private Cliente_Repository cliente_Repository;

    @Override
    public List<Cliente_Entity> findAll() {
        return cliente_Repository.findAll();
    }

    @Override
    public Cliente_Entity save(Cliente_Entity cliente) {
        return cliente_Repository.save(cliente);
    }

    @Override
    public String deleteById(Long id) {
        cliente_Repository.deleteById(id);
        return "Cliente eliminado con éxito";
    }

    @Override
    public Optional<Cliente_Entity> update(Long id, Cliente_Entity cliente) {
        Optional<Cliente_Entity> clienteExistente = cliente_Repository.findById(id);

        if (clienteExistente.isPresent()) {
            Cliente_Entity clienteActualizado = clienteExistente.get();
            clienteActualizado.setNombre(cliente.getNombre());
            clienteActualizado.setRuc(cliente.getRuc());
            clienteActualizado.setTelefono(cliente.getTelefono());
            clienteActualizado.setEstado(cliente.getEstado());

            return Optional.of(cliente_Repository.save(clienteActualizado));
        }
        return Optional.empty();
    }

    @Override
    public Optional<Cliente_Entity> findById(Long id) {
        return cliente_Repository.findById(id);
    }

    @Override
    public Optional<Cliente_Entity> findByRuc(String ruc) {
        return cliente_Repository.findByRuc(ruc);
    }
}
