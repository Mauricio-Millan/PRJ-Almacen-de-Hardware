package org.example.prj_rest_control_almacen_hardware.Controller;

import org.example.prj_rest_control_almacen_hardware.Model.Producto_Entity;
import org.example.prj_rest_control_almacen_hardware.Service.Producto_Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/productos")
public class Producto_Controller {
    @Autowired
    private Producto_Service producto_Service;

    @GetMapping
    public List<Producto_Entity> findAll() {
        return producto_Service.findAll();
    }

    @GetMapping("/{id}")
    public Optional<Producto_Entity> findById(@PathVariable Long id) {
        return producto_Service.findById(id);
    }

    @GetMapping("/nombre/{nombre}")
    public Optional<Producto_Entity> findByNombre(@PathVariable String nombre) {
        return producto_Service.findByNombre(nombre);
    }

    @PostMapping
    public Producto_Entity save(@RequestBody Producto_Entity producto) {
        return producto_Service.save(producto);
    }

    @PutMapping("/{id}")
    public Optional<Producto_Entity> update(@PathVariable Long id, @RequestBody Producto_Entity producto) {
        return producto_Service.update(id, producto);
    }

    @DeleteMapping("/{id}")
    public String deleteById(@PathVariable Long id) {
        return producto_Service.deleteById(id);
    }
}
