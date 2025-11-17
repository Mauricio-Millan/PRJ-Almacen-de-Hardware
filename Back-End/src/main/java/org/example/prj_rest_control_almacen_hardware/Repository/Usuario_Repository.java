package org.example.prj_rest_control_almacen_hardware.Repository;

import org.example.prj_rest_control_almacen_hardware.Model.Usuario_Entity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface Usuario_Repository extends JpaRepository<Usuario_Entity, Long> {
    List<Usuario_Entity> findAll();
    Optional<Usuario_Entity> findById(Long id);
    Optional<Usuario_Entity> findByDni(String dni);
    @Query("select u from Usuario_Entity u where u.dni =:dni and u.clave =:clave")
    Optional<Usuario_Entity> login(@Param("dni") String dni,@Param("clave") String clave);
}
