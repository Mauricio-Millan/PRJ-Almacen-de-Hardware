package org.example.prj_rest_control_almacen_hardware.Controller;

import org.example.prj_rest_control_almacen_hardware.Model.Movimiento_Entity;
import org.example.prj_rest_control_almacen_hardware.Service.Movimiento_Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/movimientos")
public class Movimiento_Controller {
    @Autowired
    private Movimiento_Service movimiento_Service;

    @GetMapping
    public List<Movimiento_Entity> findAll() {
        return movimiento_Service.findAll();
    }

    @GetMapping("/{id}")
    public Optional<Movimiento_Entity> findById(@PathVariable Long id) {
        return movimiento_Service.findById(id);
    }

    @PostMapping
    public Movimiento_Entity save(@RequestBody Movimiento_Entity movimiento) {
        movimiento.setId(null);
        return movimiento_Service.save(movimiento);
    }

    @PutMapping("/{id}")
    public Optional<Movimiento_Entity> update(@PathVariable Long id, @RequestBody Movimiento_Entity movimiento) {
        return movimiento_Service.update(id, movimiento);
    }

    @DeleteMapping("/{id}")
    public String deleteById(@PathVariable Long id) {
        return movimiento_Service.deleteById(id);
    }
}
