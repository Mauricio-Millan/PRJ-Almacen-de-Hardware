package org.example.prj_rest_control_almacen_hardware.Controller;


import org.example.prj_rest_control_almacen_hardware.Model.Usuario_Entity;
import org.example.prj_rest_control_almacen_hardware.Service.Usuario_Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/usuarios")
public class Usuario_Controller {
    @Autowired
private Usuario_Service usuario_Repo;

    @GetMapping
    public List<Usuario_Entity> findAll() {
        return usuario_Repo.findAll();
    }
    @GetMapping("{id}")
    public Optional<Usuario_Entity> findById(Long id) {
        return usuario_Repo.findById(id);
    }
    @PostMapping
    public Usuario_Entity save(@RequestBody Usuario_Entity usuario_Entity) {
        return usuario_Repo.save(usuario_Entity);
    }
    @PutMapping("{id}")
    public Optional<Usuario_Entity> update(@PathVariable Long id ,@RequestBody Usuario_Entity usuario_Entity) {
        return  usuario_Repo.update(id, usuario_Entity);
    }
    @DeleteMapping("{id}")
    public String deleteById(@PathVariable Long id) {
        return usuario_Repo.deleteById(id);
    }
}
