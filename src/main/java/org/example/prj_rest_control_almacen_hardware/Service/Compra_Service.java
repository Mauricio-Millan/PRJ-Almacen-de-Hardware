package org.example.prj_rest_control_almacen_hardware.Service;

import org.example.prj_rest_control_almacen_hardware.Model.Compra_Entity;
import java.util.List;
import java.util.Optional;

public interface Compra_Service {
    //CRUD
    List<Compra_Entity> findAll();
    Compra_Entity save(Compra_Entity compra);
    String deleteById(Long id);
    Optional<Compra_Entity> update(Long id, Compra_Entity compra);
    //Métodos específicos
    Optional<Compra_Entity> findById(Long id);
    List<Compra_Entity> findByIdUsuarioId(Long idUsuario);
    List<Compra_Entity> findByIdProveedorId(Long idProveedor);
}
