package org.example.prj_rest_control_almacen_hardware.Repository;

import org.example.prj_rest_control_almacen_hardware.Model.TipoAccion_Entity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TipoAccionRepository extends JpaRepository<TipoAccion_Entity,Long> {
    List<TipoAccion_Entity> findAll();

}
