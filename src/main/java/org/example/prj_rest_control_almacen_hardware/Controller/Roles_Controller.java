package org.example.prj_rest_control_almacen_hardware.Controller;

import org.example.prj_rest_control_almacen_hardware.Model.Roles_Entity;
import org.example.prj_rest_control_almacen_hardware.Service.Roles_Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/roles")
public class Roles_Controller {
    @Autowired
    private Roles_Service roles_serv;

    @GetMapping
    public List<Roles_Entity> findAll() {
        return roles_serv.findAll();
    }

    @GetMapping("/{id}")
    public Optional<Roles_Entity> findById(@PathVariable Integer id) {
        return roles_serv.findById(id);
    }

    @GetMapping("/nombre/{nombre}")
    public Optional<Roles_Entity> findByNombre(@PathVariable String nombre) {
        return roles_serv.findByNombre(nombre);
    }

    @GetMapping("/estado/{estado}")
    public List<Roles_Entity> findByEstado(@PathVariable Boolean estado) {
        return roles_serv.findByEstado(estado);
    }

    @GetMapping("/activos")
    public List<Roles_Entity> findByEstadoActivo() {
        return roles_serv.findByEstadoActivo();
    }

    @PostMapping
    public Roles_Entity save(@RequestBody Roles_Entity roles_Entity) {
        roles_Entity.setId(null);
        return roles_serv.save(roles_Entity);
    }

    @PutMapping("/{id}")
    public Optional<Roles_Entity> update(@PathVariable Integer id, @RequestBody Roles_Entity roles_Entity) {
        return roles_serv.update(id, roles_Entity);
    }

    @DeleteMapping("/{id}")
    public String deleteById(@PathVariable Integer id) {
        return roles_serv.deleteById(id);
    }
}
