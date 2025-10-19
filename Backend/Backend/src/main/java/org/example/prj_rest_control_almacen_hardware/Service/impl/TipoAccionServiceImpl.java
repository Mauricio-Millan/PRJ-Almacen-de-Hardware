package org.example.prj_rest_control_almacen_hardware.Service.impl;

import org.example.prj_rest_control_almacen_hardware.Model.TipoAccion_Entity;
import org.example.prj_rest_control_almacen_hardware.Repository.TipoAccionRepository;
import org.example.prj_rest_control_almacen_hardware.Service.TipoAccionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TipoAccionServiceImpl implements TipoAccionService {
    @Autowired
    private TipoAccionRepository tipoAccionrepo;

    @Override
    public List<TipoAccion_Entity> findAll() {
        return tipoAccionrepo.findAll();
    }




}
