package org.example.prj_rest_control_almacen_hardware.Service;

import org.example.prj_rest_control_almacen_hardware.Model.Usuario_Entity;
import org.example.prj_rest_control_almacen_hardware.Repository.Usuario_Repository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.swing.text.html.Option;
import java.util.List;
import java.util.Optional;

@Service
public class Usuario_Service_Impl  implements Usuario_Service {
    @Autowired
    private Usuario_Repository usuario_Serv;

    @Override
public List<Usuario_Entity> findAll() {
        return (List<Usuario_Entity>) usuario_Serv.findAll();
    }

    @Override
    public Usuario_Entity save(Usuario_Entity usuario) {
        return usuario_Serv.save(usuario);
    }

    @Override
    public String deleteById(Long id) {
        usuario_Serv.deleteById(id);
        return "Usuario eliminado con exito";
    }
    @Override
    public Optional<Usuario_Entity> update(Long id, Usuario_Entity usuario) {
        Optional<Usuario_Entity> usuarioExistente = usuario_Serv.findById(id);

        if (usuarioExistente.isPresent()) {
            Usuario_Entity usuarioActualizado = usuarioExistente.get();
            usuarioActualizado.setNombre(usuario.getNombre());
            usuarioActualizado.setClave(usuario.getClave());

            return Optional.of(usuario_Serv.save(usuarioActualizado));
        }
        return Optional.empty(); // O lanzar excepción si el usuario no existe
    }


    @Override
    public Optional<Usuario_Entity> findById(Long id) {
        return usuario_Serv.findById(id);
    }

    @Override
    public Optional<Usuario_Entity> findByDni(String dni) {
        return usuario_Serv.findByDni(dni);
    }

    @Override
    public Optional<Usuario_Entity> Login(Usuario_Entity usuario) {
        return usuario_Serv.login(usuario.getDni(),usuario.getClave());
    }
}
