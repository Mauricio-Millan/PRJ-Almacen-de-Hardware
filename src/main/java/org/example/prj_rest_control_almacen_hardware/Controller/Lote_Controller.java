package org.example.prj_rest_control_almacen_hardware.Controller;

import org.example.prj_rest_control_almacen_hardware.Model.Lote_Entity;
import org.example.prj_rest_control_almacen_hardware.Service.Lote_Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/lotes")
public class Lote_Controller {
    @Autowired
    private Lote_Service lote_Service;

    @GetMapping
    public List<Lote_Entity> findAll() {
        return lote_Service.findAll();
    }

    @GetMapping("/{id}")
    public Optional<Lote_Entity> findById(@PathVariable Long id) {
        return lote_Service.findById(id);
    }

    @PostMapping
    public Lote_Entity save(@RequestBody Lote_Entity lote) {
        return lote_Service.save(lote);
    }

    @PutMapping("/{id}")
    public Optional<Lote_Entity> update(@PathVariable Long id, @RequestBody Lote_Entity lote) {
        return lote_Service.update(id, lote);
    }

    @DeleteMapping("/{id}")
    public String deleteById(@PathVariable Long id) {
        return lote_Service.deleteById(id);
    }
}
