package org.example.prj_rest_control_almacen_hardware.Controller;

import org.example.prj_rest_control_almacen_hardware.Model.ContenidoAlmacen_Entity;
import org.example.prj_rest_control_almacen_hardware.Service.ContenidoAlmacen_Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/contenido-almacenes")
public class ContenidoAlmacen_Controller {
    @Autowired
    private ContenidoAlmacen_Service contenidoAlmacen_Service;

    @GetMapping
    public List<ContenidoAlmacen_Entity> findAll() {
        return contenidoAlmacen_Service.findAll();
    }

    @GetMapping("/{id}")
    public Optional<ContenidoAlmacen_Entity> findById(@PathVariable Long id) {
        return contenidoAlmacen_Service.findById(id);
    }

    @GetMapping("/almacen/{idAlmacen}")
    public List<ContenidoAlmacen_Entity> findByIdAlmacen(@PathVariable Long idAlmacen) {
        return contenidoAlmacen_Service.findByIdAlmacenId(idAlmacen);
    }

    @GetMapping("/lote/{idLote}")
    public List<ContenidoAlmacen_Entity> findByIdLote(@PathVariable Long idLote) {
        return contenidoAlmacen_Service.findByIdLoteId(idLote);
    }

    @GetMapping("/almacen/{idAlmacen}/lote/{idLote}")
    public Optional<ContenidoAlmacen_Entity> findByAlmacenAndLote(@PathVariable Long idAlmacen, @PathVariable Long idLote) {
        return contenidoAlmacen_Service.findByIdAlmacenIdAndIdLoteId(idAlmacen, idLote);
    }
}
