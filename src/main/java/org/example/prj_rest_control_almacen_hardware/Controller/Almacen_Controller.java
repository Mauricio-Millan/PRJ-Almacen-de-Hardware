package org.example.prj_rest_control_almacen_hardware.Controller;

import org.example.prj_rest_control_almacen_hardware.DTOs.ConsultaAlmacenDetalladoDTO;
import org.example.prj_rest_control_almacen_hardware.Model.Almacen_Entity;
import org.example.prj_rest_control_almacen_hardware.Service.Almacen_Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/almacenes")
public class Almacen_Controller {
    @Autowired
    private Almacen_Service almacen_Service;

    @GetMapping
    public List<Almacen_Entity> findAll() {
        return almacen_Service.findAll();
    }

    @GetMapping("/{id}")
    public Optional<Almacen_Entity> findById(@PathVariable Long id) {
        return almacen_Service.findById(id);
    }

    @GetMapping("/nombre/{nombre}")
    public Optional<Almacen_Entity> findByNombre(@PathVariable String nombre) {
        return almacen_Service.findByNombre(nombre);
    }

    @PostMapping
    public Almacen_Entity save(@RequestBody Almacen_Entity almacen) {
        almacen.setId(null);
        return almacen_Service.save(almacen);
    }

    @PutMapping("/{id}")
    public Optional<Almacen_Entity> update(@PathVariable Long id, @RequestBody Almacen_Entity almacen) {
        return almacen_Service.update(id, almacen);
    }

    @DeleteMapping("/{id}")
    public String deleteById(@PathVariable Long id) {
        return almacen_Service.deleteById(id);
    }

    @GetMapping("/{id}/detalle")
    public ResponseEntity<ConsultaAlmacenDetalladoDTO> obtenerContenidoDetallado(
            @PathVariable Integer id,
            @RequestParam(required = false) String nombreProducto) {

        ConsultaAlmacenDetalladoDTO resultado =
            almacen_Service.obtenerContenidoDetallado(id, nombreProducto);

        return ResponseEntity.ok(resultado);
    }
}
