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
    private Producto_Service producto_serv;

    @GetMapping
    public List<Producto_Entity> findAll() {
        return producto_serv.findAll();
    }

    @GetMapping("/{id}")
    public Optional<Producto_Entity> findById(@PathVariable Integer id) {
        return producto_serv.findById(id);
    }

    @GetMapping("/nombre/{nombre}")
    public Optional<Producto_Entity> findByNombre(@PathVariable String nombre) {
        return producto_serv.findByNombre(nombre);
    }

    @GetMapping("/estado/{estado}")
    public List<Producto_Entity> findByEstado(@PathVariable Boolean estado) {
        return producto_serv.findByEstado(estado);
    }

    @GetMapping("/marca/{marcaId}")
    public List<Producto_Entity> findByMarcaId(@PathVariable Integer marcaId) {
        return producto_serv.findByMarcaId(marcaId);
    }

    @GetMapping("/activos")
    public List<Producto_Entity> findByEstadoActivo() {
        return producto_serv.findByEstadoActivo();
    }

    @PostMapping
    public Producto_Entity save(@RequestBody Producto_Entity producto_Entity) {
        producto_Entity.setId(null);
        return producto_serv.save(producto_Entity);
    }

    @PutMapping("/{id}")
    public Optional<Producto_Entity> update(@PathVariable Integer id, @RequestBody Producto_Entity producto_Entity) {
        return producto_serv.update(id, producto_Entity);
    }

    @DeleteMapping("/{id}")
    public String deleteById(@PathVariable Integer id) {
        return producto_serv.deleteById(id);
    }
}
