package org.example.prj_rest_control_almacen_hardware.Service.impl;

import org.example.prj_rest_control_almacen_hardware.DTOs.LineaTiempoUsuarioDTO;
import org.example.prj_rest_control_almacen_hardware.Model.Usuario_Entity;
import org.example.prj_rest_control_almacen_hardware.Repository.Usuario_Repository;
import org.example.prj_rest_control_almacen_hardware.Repository.UsuarioCustomRepository;
import org.example.prj_rest_control_almacen_hardware.Service.Usuario_Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class Usuario_Service_Impl  implements Usuario_Service {
    @Autowired
    private Usuario_Repository usuario_repo;

    @Autowired
    private UsuarioCustomRepository usuarioCustomRepository;

    @Override
public List<Usuario_Entity> findAll() {
        return (List<Usuario_Entity>) usuario_repo.findAll();
    }

    @Override
    public Usuario_Entity save(Usuario_Entity usuario) {
        return usuario_repo.save(usuario);
    }

    @Override
    public String deleteById(Long id) {
        usuario_repo.deleteById(id);
        return "Usuario eliminado con exito";
    }
    @Override
    public Optional<Usuario_Entity> update(Long id, Usuario_Entity usuario) {
        Optional<Usuario_Entity> usuarioExistente = usuario_repo.findById(id);

        if (usuarioExistente.isPresent()) {
            Usuario_Entity usuarioActualizado = usuarioExistente.get();
            usuarioActualizado.setNombre(usuario.getNombre());
            usuarioActualizado.setClave(usuario.getClave());

            return Optional.of(usuario_repo.save(usuarioActualizado));
        }
        return Optional.empty(); // O lanzar excepción si el usuario no existe
    }

    @Override
    public Optional<Usuario_Entity> findById(Long id) {
        return usuario_repo.findById(id);
    }

    @Override
    public Optional<Usuario_Entity> findByDni(String dni) {
        return usuario_repo.findByDni(dni);
    }

    @Override
    public Optional<Usuario_Entity> Login(Usuario_Entity usuario) {
        return usuario_repo.login(usuario.getDni(),usuario.getClave());
    }

    @Override
    public LineaTiempoUsuarioDTO obtenerLineaTiempoUsuario(Integer idUsuario, LocalDateTime fechaDesde, LocalDateTime fechaHasta, Integer idTipoAccion) {
        return usuarioCustomRepository.obtenerLineaTiempoUsuario(idUsuario, fechaDesde, fechaHasta, idTipoAccion);
    }
}
