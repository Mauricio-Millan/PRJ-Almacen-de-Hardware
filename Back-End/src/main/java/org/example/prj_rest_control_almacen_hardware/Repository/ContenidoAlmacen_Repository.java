package org.example.prj_rest_control_almacen_hardware.Repository;

import org.example.prj_rest_control_almacen_hardware.Model.ContenidoAlmacen_Entity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ContenidoAlmacen_Repository extends JpaRepository<ContenidoAlmacen_Entity, Long> {
    List<ContenidoAlmacen_Entity> findAll();
    Optional<ContenidoAlmacen_Entity> findById(Long id);
    List<ContenidoAlmacen_Entity> findByIdAlmacenId(Long idAlmacen);
    List<ContenidoAlmacen_Entity> findByIdLoteId(Long idLote);
    Optional<ContenidoAlmacen_Entity> findByIdAlmacenIdAndIdLoteId(Long idAlmacen, Long idLote);
}
