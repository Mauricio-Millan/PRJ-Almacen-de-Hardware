package org.example.prj_rest_control_almacen_hardware.mapper;

import org.example.prj_rest_control_almacen_hardware.Model.TipoAccion_Entity;
import org.example.prj_rest_control_almacen_hardware.dto.TipoAccionDTO;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class TipoAccionMapper {

    public TipoAccionDTO toDto(TipoAccion_Entity tipoAccion_entity) {
        return new TipoAccionDTO(tipoAccion_entity.getNombre());
    }

    public List<TipoAccionDTO> toDtoList(List<TipoAccion_Entity> tipoAccion_entity) {
        return tipoAccion_entity.stream().map(this::toDto).toList();
    }

}
