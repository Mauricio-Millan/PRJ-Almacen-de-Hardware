package org.example.prj_rest_control_almacen_hardware.Service;

import org.example.prj_rest_control_almacen_hardware.Model.Lote_Entity;

import java.util.List;
import java.util.Optional;

public interface Lote_Service {
    //CRUD
    List<Lote_Entity> findAll();
    Lote_Entity save(Lote_Entity lote);
    String deleteById(Long id);
    Optional<Lote_Entity> update(Long id, Lote_Entity lote);
    //Métodos específicos
    Optional<Lote_Entity> findById(Long id);
}
