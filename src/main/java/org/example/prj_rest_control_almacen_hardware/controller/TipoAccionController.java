package org.example.prj_rest_control_almacen_hardware.Controller;

import org.example.prj_rest_control_almacen_hardware.Model.TipoAccion_Entity;
import org.example.prj_rest_control_almacen_hardware.Service.TipoAccionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;


@RestController
@RequestMapping("/acciones")
public class TipoAccionController {

    @Autowired
    private TipoAccionService tipoAccionService;

    @GetMapping
    public List<TipoAccion_Entity> findAll() {
        return tipoAccionService.findAll();
    }
}
