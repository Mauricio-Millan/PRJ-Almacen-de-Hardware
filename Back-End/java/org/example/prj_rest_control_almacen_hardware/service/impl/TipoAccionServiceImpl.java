package org.example.prj_rest_control_almacen_hardware.service.impl;

import org.example.prj_rest_control_almacen_hardware.Model.TipoAccion_Entity;
import org.example.prj_rest_control_almacen_hardware.dto.TipoAccionDTO;
import org.example.prj_rest_control_almacen_hardware.mapper.TipoAccionMapper;
import org.example.prj_rest_control_almacen_hardware.repository.TipoAccionRepository;
import org.example.prj_rest_control_almacen_hardware.service.TipoAccionService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TipoAccionServiceImpl implements TipoAccionService {

    private final TipoAccionRepository tipoAccionRepository;
    private final TipoAccionMapper tipoAccionMapper;

    public TipoAccionServiceImpl(TipoAccionRepository tipoAccionRepository, TipoAccionMapper tipoAccionMapper) {
        this.tipoAccionRepository = tipoAccionRepository;
        this.tipoAccionMapper = tipoAccionMapper;
    }

    public List<TipoAccionDTO> getAllTipoAccion() {
        List<TipoAccion_Entity> listaTipoAccion = tipoAccionRepository.findAll();
        return tipoAccionMapper.toDtoList(listaTipoAccion);
    }

    public TipoAccionDTO getTipoAccionById(int id) {
        TipoAccion_Entity tipoAccion = tipoAccionRepository.findById(id).orElseThrow(()->new RuntimeException("TipoAccion no encontrado"));
        return tipoAccionMapper.toDto(tipoAccion);
    }

}
