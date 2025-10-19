package org.example.prj_rest_control_almacen_hardware.Service;

import org.example.prj_rest_control_almacen_hardware.Model.ContenidoAlmacen_Entity;

import java.util.List;
import java.util.Optional;

public interface ContenidoAlmacen_Service {
    // Solo métodos de consulta
    List<ContenidoAlmacen_Entity> findAll();
    Optional<ContenidoAlmacen_Entity> findById(Long id);
    List<ContenidoAlmacen_Entity> findByIdAlmacenId(Long idAlmacen);
    List<ContenidoAlmacen_Entity> findByIdLoteId(Long idLote);
    Optional<ContenidoAlmacen_Entity> findByIdAlmacenIdAndIdLoteId(Long idAlmacen, Long idLote);
}
