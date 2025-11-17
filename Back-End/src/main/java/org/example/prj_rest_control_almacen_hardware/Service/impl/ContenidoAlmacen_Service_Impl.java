package org.example.prj_rest_control_almacen_hardware.Service.impl;

import org.example.prj_rest_control_almacen_hardware.Model.ContenidoAlmacen_Entity;
import org.example.prj_rest_control_almacen_hardware.Repository.ContenidoAlmacen_Repository;
import org.example.prj_rest_control_almacen_hardware.Service.ContenidoAlmacen_Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ContenidoAlmacen_Service_Impl implements ContenidoAlmacen_Service {
    @Autowired
    private ContenidoAlmacen_Repository contenidoAlmacen_Repository;

    @Override
    public List<ContenidoAlmacen_Entity> findAll() {
        return contenidoAlmacen_Repository.findAll();
    }

    @Override
    public Optional<ContenidoAlmacen_Entity> findById(Long id) {
        return contenidoAlmacen_Repository.findById(id);
    }

    @Override
    public List<ContenidoAlmacen_Entity> findByIdAlmacenId(Long idAlmacen) {
        return contenidoAlmacen_Repository.findByIdAlmacenId(idAlmacen);
    }

    @Override
    public List<ContenidoAlmacen_Entity> findByIdLoteId(Long idLote) {
        return contenidoAlmacen_Repository.findByIdLoteId(idLote);
    }

    @Override
    public Optional<ContenidoAlmacen_Entity> findByIdAlmacenIdAndIdLoteId(Long idAlmacen, Long idLote) {
        return contenidoAlmacen_Repository.findByIdAlmacenIdAndIdLoteId(idAlmacen, idLote);
    }
}
