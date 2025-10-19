package org.example.prj_rest_control_almacen_hardware.Controller;

import org.example.prj_rest_control_almacen_hardware.Model.Proveedor_Entity;
import org.example.prj_rest_control_almacen_hardware.Service.Proveedor_Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/proveedores")
public class Proveedor_Controller {
    @Autowired
    private Proveedor_Service proveedor_Service;

    @GetMapping
    public List<Proveedor_Entity> findAll() {
        return proveedor_Service.findAll();
    }

    @GetMapping("/{id}")
    public Optional<Proveedor_Entity> findById(@PathVariable Long id) {
        return proveedor_Service.findById(id);
    }

    @GetMapping("/ruc/{ruc}")
    public Optional<Proveedor_Entity> findByRuc(@PathVariable String ruc) {
        return proveedor_Service.findByRuc(ruc);
    }

    @PostMapping
    public Proveedor_Entity save(@RequestBody Proveedor_Entity proveedor) {
        proveedor.setId(null);
        return proveedor_Service.save(proveedor);
    }

    @PutMapping("/{id}")
    public Optional<Proveedor_Entity> update(@PathVariable Long id, @RequestBody Proveedor_Entity proveedor) {
        return proveedor_Service.update(id, proveedor);
    }

    @DeleteMapping("/{id}")
    public String deleteById(@PathVariable Long id) {
        return proveedor_Service.deleteById(id);
    }
}
