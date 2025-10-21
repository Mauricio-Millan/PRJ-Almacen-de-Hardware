package org.example.prj_rest_control_almacen_hardware.Service.impl;

import org.example.prj_rest_control_almacen_hardware.DTOs.ConsultaAlmacenDetalladoDTO;
import org.example.prj_rest_control_almacen_hardware.Model.Almacen_Entity;
import org.example.prj_rest_control_almacen_hardware.Repository.Almacen_Repository;
import org.example.prj_rest_control_almacen_hardware.Repository.AlmacenCustomRepository;
import org.example.prj_rest_control_almacen_hardware.Service.Almacen_Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class Almacen_Service_Impl implements Almacen_Service {
    @Autowired
    private Almacen_Repository almacen_Repository;

    @Autowired
    private AlmacenCustomRepository almacenCustomRepository;

    @Override
    public List<Almacen_Entity> findAll() {
        return almacen_Repository.findAll();
    }

    @Override
    public Almacen_Entity save(Almacen_Entity almacen) {
        return almacen_Repository.save(almacen);
    }

    @Override
    public String deleteById(Long id) {
        almacen_Repository.deleteById(id);
        return "Almacén eliminado con éxito";
    }

    @Override
    public Optional<Almacen_Entity> update(Long id, Almacen_Entity almacen) {
        Optional<Almacen_Entity> almacenExistente = almacen_Repository.findById(id);

        if (almacenExistente.isPresent()) {
            Almacen_Entity almacenActualizado = almacenExistente.get();
            almacenActualizado.setNombre(almacen.getNombre());
            almacenActualizado.setDireccion(almacen.getDireccion());
            almacenActualizado.setTelefono(almacen.getTelefono());

            return Optional.of(almacen_Repository.save(almacenActualizado));
        }
        return Optional.empty();
    }

    @Override
    public Optional<Almacen_Entity> findById(Long id) {
        return almacen_Repository.findById(id);
    }

    @Override
    public Optional<Almacen_Entity> findByNombre(String nombre) {
        return almacen_Repository.findByNombre(nombre);
    }

    @Override
    public ConsultaAlmacenDetalladoDTO obtenerContenidoDetallado(Integer idAlmacen, String nombreProducto) {
        return almacenCustomRepository.consultarContenidoDetallado(idAlmacen, nombreProducto);
    }
}
