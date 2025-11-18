package org.example.prj_rest_control_almacen_hardware.Controller;

import org.example.prj_rest_control_almacen_hardware.Model.MovimientoLinea_Entity;
import org.example.prj_rest_control_almacen_hardware.Service.MovimientoLinea_Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/movimiento-lineas")
public class MovimientoLinea_Controller {
    @Autowired
    private MovimientoLinea_Service movimientoLinea_Service;

    @GetMapping
    public List<MovimientoLinea_Entity> findAll() {
        return movimientoLinea_Service.findAll();
    }

    @GetMapping("/{id}")
    public Optional<MovimientoLinea_Entity> findById(@PathVariable Long id) {
        return movimientoLinea_Service.findById(id);
    }

    @GetMapping("/movimiento/{idMovimiento}")
    public List<MovimientoLinea_Entity> findByIdMovimiento(@PathVariable Long idMovimiento) {
        return movimientoLinea_Service.findByIdMovimiento(idMovimiento);
    }

    @PostMapping
    public MovimientoLinea_Entity save(@RequestBody MovimientoLinea_Entity movimientoLinea) {
        movimientoLinea.setId(null);
        return movimientoLinea_Service.save(movimientoLinea);
    }

    @PutMapping("/{id}")
    public Optional<MovimientoLinea_Entity> update(@PathVariable Long id, @RequestBody MovimientoLinea_Entity movimientoLinea) {
        return movimientoLinea_Service.update(id, movimientoLinea);
    }

    @DeleteMapping("/{id}")
    public String deleteById(@PathVariable Long id) {
        return movimientoLinea_Service.deleteById(id);
    }
}
