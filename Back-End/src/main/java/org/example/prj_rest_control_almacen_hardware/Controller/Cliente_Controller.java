package org.example.prj_rest_control_almacen_hardware.Controller;

import org.example.prj_rest_control_almacen_hardware.Model.Cliente_Entity;
import org.example.prj_rest_control_almacen_hardware.Service.Cliente_Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/clientes")
public class Cliente_Controller {
    @Autowired
    private Cliente_Service cliente_Service;

    @GetMapping
    public List<Cliente_Entity> findAll() {
        return cliente_Service.findAll();
    }

    @GetMapping("/{id}")
    public Optional<Cliente_Entity> findById(@PathVariable Long id) {
        return cliente_Service.findById(id);
    }

    @GetMapping("/ruc/{ruc}")
    public Optional<Cliente_Entity> findByRuc(@PathVariable String ruc) {
        return cliente_Service.findByRuc(ruc);
    }

    @PostMapping
    public Cliente_Entity save(@RequestBody Cliente_Entity cliente) {
        cliente.setId(null);
        return cliente_Service.save(cliente);
    }
    @PutMapping("/{id}")
    public Optional<Cliente_Entity> update(@PathVariable Long id, @RequestBody Cliente_Entity cliente) {
        return cliente_Service.update(id, cliente);
    }

    @DeleteMapping("/{id}")
    public String deleteById(@PathVariable Long id) {
        return cliente_Service.deleteById(id);
    }
}

