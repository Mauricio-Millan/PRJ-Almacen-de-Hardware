package org.example.prj_rest_control_almacen_hardware.Service.impl;

import org.example.prj_rest_control_almacen_hardware.DTOs.LineaTiempoUsuarioDTO;
import org.example.prj_rest_control_almacen_hardware.DTOs.LoginRequestDTO;
import org.example.prj_rest_control_almacen_hardware.DTOs.LoginResponseDTO;
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
    public LoginResponseDTO loginConValidacion(LoginRequestDTO loginRequest) {
        // Validar que los campos no estén vacíos
        if (loginRequest.getDni() == null || loginRequest.getDni().trim().isEmpty()) {
            return new LoginResponseDTO("El DNI es obligatorio", "CAMPO_VACIO");
        }

        if (loginRequest.getClave() == null || loginRequest.getClave().trim().isEmpty()) {
            return new LoginResponseDTO("La contraseña es obligatoria", "CAMPO_VACIO");
        }

        // 1. Verificar si el usuario existe por DNI
        Optional<Usuario_Entity> usuarioExistente = usuario_repo.findByDni(loginRequest.getDni());

        if (usuarioExistente.isEmpty()) {
            // DNI no existe
            return new LoginResponseDTO("El DNI ingresado no está registrado en el sistema", "DNI_INCORRECTO");
        }

        // 2. Si el usuario existe, verificar la clave
        Usuario_Entity usuario = usuarioExistente.get();

        if (!usuario.getClave().equals(loginRequest.getClave())) {
            // Clave incorrecta
            return new LoginResponseDTO("La contraseña ingresada es incorrecta", "CLAVE_INCORRECTA");
        }

        // 3. Login exitoso - devolver el usuario completo
        return new LoginResponseDTO(usuario);
    }

    @Override
    public LineaTiempoUsuarioDTO obtenerLineaTiempoUsuario(Integer idUsuario, LocalDateTime fechaDesde, LocalDateTime fechaHasta, Integer idTipoAccion) {
        return usuarioCustomRepository.obtenerLineaTiempoUsuario(idUsuario, fechaDesde, fechaHasta, idTipoAccion);
    }
}
