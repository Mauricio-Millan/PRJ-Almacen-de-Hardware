package org.example.prj_rest_control_almacen_hardware.Controller;

import org.example.prj_rest_control_almacen_hardware.Model.Marca_Entity;
import org.example.prj_rest_control_almacen_hardware.Service.Marca_Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/marcas")
public class Marca_Controller {
    @Autowired
    private Marca_Service marca_Service;

    @GetMapping
    public List<Marca_Entity> findAll() {
        return marca_Service.findAll();
    }

    @GetMapping("/{id}")
    public Optional<Marca_Entity> findById(@PathVariable Long id) {
        return marca_Service.findById(id);
    }

    @GetMapping("/nombre/{nombre}")
    public Optional<Marca_Entity> findByNombre(@PathVariable String nombre) {
        return marca_Service.findByNombre(nombre);
    }

    @PostMapping
    public Marca_Entity save(@RequestBody Marca_Entity marca) {
        marca.setId(null);
        return marca_Service.save(marca);
    }
    @PutMapping("/{id}")
    public Optional<Marca_Entity> update(@PathVariable Long id, @RequestBody Marca_Entity marca) {
        return marca_Service.update(id, marca);
    }

    @DeleteMapping("/{id}")
    public String deleteById(@PathVariable Long id) {
        return marca_Service.deleteById(id);
    }
}

