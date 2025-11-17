package org.example.prj_rest_control_almacen_hardware.Controller;

import org.example.prj_rest_control_almacen_hardware.Model.Venta_Entity;
import org.example.prj_rest_control_almacen_hardware.Service.Venta_Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/ventas")
public class Venta_Controller {
    @Autowired
    private Venta_Service venta_serv;

    @GetMapping
    public List<Venta_Entity> findAll() {
        return venta_serv.findAll();
    }

    @GetMapping("/{id}")
    public Optional<Venta_Entity> findById(@PathVariable Integer id) {
        return venta_serv.findById(id);
    }

    @GetMapping("/estado/{estado}")
    public List<Venta_Entity> findByEstado(@PathVariable Boolean estado) {
        return venta_serv.findByEstado(estado);
    }

    @GetMapping("/fecha/{fecha}")
    public List<Venta_Entity> findByFecha(@PathVariable LocalDate fecha) {
        return venta_serv.findByFecha(fecha);
    }

    @GetMapping("/usuario/{usuarioId}")
    public List<Venta_Entity> findByUsuarioId(@PathVariable Integer usuarioId) {
        return venta_serv.findByUsuarioId(usuarioId);
    }

    @GetMapping("/cliente/{clienteId}")
    public List<Venta_Entity> findByClienteId(@PathVariable Integer clienteId) {
        return venta_serv.findByClienteId(clienteId);
    }

    @GetMapping("/fechas/{fechaInicio}/{fechaFin}")
    public List<Venta_Entity> findByFechaBetween(@PathVariable LocalDate fechaInicio, @PathVariable LocalDate fechaFin) {
        return venta_serv.findByFechaBetween(fechaInicio, fechaFin);
    }

    @GetMapping("/activas")
    public List<Venta_Entity> findByEstadoActivo() {
        return venta_serv.findByEstadoActivo();
    }

    @PostMapping
    public Venta_Entity save(@RequestBody Venta_Entity venta_Entity) {
        venta_Entity.setId(null);
        return venta_serv.save(venta_Entity);
    }

    @PutMapping("/{id}")
    public Optional<Venta_Entity> update(@PathVariable Integer id, @RequestBody Venta_Entity venta_Entity) {
        return venta_serv.update(id, venta_Entity);
    }

    @DeleteMapping("/{id}")
    public String deleteById(@PathVariable Integer id) {
        return venta_serv.deleteById(id);
    }
}
