package org.example.prj_rest_control_almacen_hardware.Controller;

import org.example.prj_rest_control_almacen_hardware.Model.Compra_Entity;
import org.example.prj_rest_control_almacen_hardware.Service.Compra_Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/compras")
public class Compra_Controller {
    @Autowired
    private Compra_Service compra_Service;

    @GetMapping
    public List<Compra_Entity> findAll() {
        return compra_Service.findAll();
    }

    @GetMapping("/{id}")
    public Optional<Compra_Entity> findById(@PathVariable Long id) {
        return compra_Service.findById(id);
    }

    @GetMapping("/usuario/{idUsuario}")
    public List<Compra_Entity> findByIdUsuario(@PathVariable Long idUsuario) {
        return compra_Service.findByIdUsuarioId(idUsuario);
    }

    @GetMapping("/proveedor/{idProveedor}")
    public List<Compra_Entity> findByIdProveedor(@PathVariable Long idProveedor) {
        return compra_Service.findByIdProveedorId(idProveedor);
    }

    @PostMapping
    public Compra_Entity save(@RequestBody Compra_Entity compra) {
        compra.setId(null);
        return compra_Service.save(compra);
    }

    @PutMapping("/{id}")
    public Optional<Compra_Entity> update(@PathVariable Long id, @RequestBody Compra_Entity compra) {
        return compra_Service.update(id, compra);
    }

    @DeleteMapping("/{id}")
    public String deleteById(@PathVariable Long id) {
        return compra_Service.deleteById(id);
    }
}

