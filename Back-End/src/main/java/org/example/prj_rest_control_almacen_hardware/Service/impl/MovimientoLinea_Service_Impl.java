package org.example.prj_rest_control_almacen_hardware.Service.impl;

import org.example.prj_rest_control_almacen_hardware.DTOs.CrearMovimientoLineaDTO;
import org.example.prj_rest_control_almacen_hardware.Model.*;
import org.example.prj_rest_control_almacen_hardware.Repository.*;
import org.example.prj_rest_control_almacen_hardware.Service.MovimientoLinea_Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.sql.PreparedStatement;
import java.util.List;
import java.util.Optional;

@Service
public class MovimientoLinea_Service_Impl implements MovimientoLinea_Service {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private MovimientoLinea_Repository movimientoLinea_Repository;

    @Autowired
    private Movimiento_Repository movimiento_Repository;

    @Autowired
    private Almacen_Repository almacen_Repository;

    @Autowired
    private Lote_Repository lote_Repository;

    @Override
    public List<MovimientoLinea_Entity> findAll() {
        return movimientoLinea_Repository.findAll();
    }

    @Override
    public MovimientoLinea_Entity save(MovimientoLinea_Entity movimientoLinea) {
        return movimientoLinea_Repository.save(movimientoLinea);
    }

    @Override
    @Transactional(propagation = Propagation.MANDATORY)
    public MovimientoLinea_Entity crearDesdeDTO(CrearMovimientoLineaDTO dto) throws Exception {
        System.out.println("DEBUG [crearDesdeDTO]: Iniciando...");
        System.out.println("DEBUG [crearDesdeDTO]: DTO recibido - idMovimiento: " + dto.getIdMovimiento());
        System.out.println("DEBUG [crearDesdeDTO]: DTO recibido - idLote: " + dto.getIdLote());
        System.out.println("DEBUG [crearDesdeDTO]: DTO recibido - idAlmacenOrigen: " + dto.getIdAlmacenOrigen());
        System.out.println("DEBUG [crearDesdeDTO]: DTO recibido - idAlmacenDestino: " + dto.getIdAlmacenDestino());

        try {
            String sql = "INSERT INTO MovimientoLinea (id_movimiento, id_almacen_origen, id_almacen_destino, id_lote, cantidad_delta, Precio_Venta) " +
                         "VALUES (?, ?, ?, ?, ?, ?)";

            System.out.println("DEBUG [crearDesdeDTO]: SQL preparado: " + sql);
            System.out.println("DEBUG [crearDesdeDTO]: Ejecutando INSERT...");

            jdbcTemplate.update(connection -> {
                PreparedStatement ps = connection.prepareStatement(sql);
                ps.setLong(1, dto.getIdMovimiento());
                if (dto.getIdAlmacenOrigen() != null) {
                    ps.setLong(2, dto.getIdAlmacenOrigen());
                } else {
                    ps.setNull(2, java.sql.Types.INTEGER);
                }
                if (dto.getIdAlmacenDestino() != null) {
                    ps.setLong(3, dto.getIdAlmacenDestino());
                } else {
                    ps.setNull(3, java.sql.Types.INTEGER);
                }
                ps.setLong(4, dto.getIdLote());
                ps.setInt(5, dto.getCantidadDelta());
                if (dto.getPrecioVenta() != null) {
                    ps.setBigDecimal(6, dto.getPrecioVenta());
                } else {
                    ps.setNull(6, java.sql.Types.DECIMAL);
                }
                return ps;
            });

            System.out.println("DEBUG [crearDesdeDTO]: INSERT ejecutado correctamente");

            // Construir y retornar una entidad con los datos insertados
            // No necesitamos recuperarla de la BD para confirmar que se creó
            MovimientoLinea_Entity resultado = new MovimientoLinea_Entity();

            // Obtener las entidades relacionadas para construir el objeto completo
            Movimiento_Entity movimiento = movimiento_Repository.findById(dto.getIdMovimiento())
                .orElseThrow(() -> new Exception("Movimiento no encontrado"));
            resultado.setIdMovimiento(movimiento);

            Lote_Entity lote = lote_Repository.findById(dto.getIdLote())
                .orElseThrow(() -> new Exception("Lote no encontrado"));
            resultado.setIdLote(lote);

            if (dto.getIdAlmacenOrigen() != null) {
                Almacen_Entity almacenOrigen = almacen_Repository.findById(dto.getIdAlmacenOrigen())
                    .orElseThrow(() -> new Exception("Almacén origen no encontrado"));
                resultado.setIdAlmacenOrigen(almacenOrigen);
            }

            if (dto.getIdAlmacenDestino() != null) {
                Almacen_Entity almacenDestino = almacen_Repository.findById(dto.getIdAlmacenDestino())
                    .orElseThrow(() -> new Exception("Almacén destino no encontrado"));
                resultado.setIdAlmacenDestino(almacenDestino);
            }

            resultado.setCantidadDelta(dto.getCantidadDelta());
            resultado.setPrecioVenta(dto.getPrecioVenta());

            System.out.println("DEBUG [crearDesdeDTO]: MovimientoLinea creado exitosamente");
            return resultado;

        } catch (Exception e) {
            System.err.println("ERROR [crearDesdeDTO]: " + e.getClass().getName());
            System.err.println("ERROR [crearDesdeDTO]: Mensaje: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Override
    public String deleteById(Long id) {
        movimientoLinea_Repository.deleteById(id);
        return "MovimientoLinea eliminado con éxito";
    }

    @Override
    public Optional<MovimientoLinea_Entity> update(Long id, MovimientoLinea_Entity movimientoLinea) {
        Optional<MovimientoLinea_Entity> movimientoLineaExistente = movimientoLinea_Repository.findById(id);

        if (movimientoLineaExistente.isPresent()) {
            MovimientoLinea_Entity movimientoLineaActualizado = movimientoLineaExistente.get();
            movimientoLineaActualizado.setIdMovimiento(movimientoLinea.getIdMovimiento());
            movimientoLineaActualizado.setIdAlmacenOrigen(movimientoLinea.getIdAlmacenOrigen());
            movimientoLineaActualizado.setIdAlmacenDestino(movimientoLinea.getIdAlmacenDestino());
            movimientoLineaActualizado.setIdLote(movimientoLinea.getIdLote());
            movimientoLineaActualizado.setCantidadDelta(movimientoLinea.getCantidadDelta());
            movimientoLineaActualizado.setPrecioVenta(movimientoLinea.getPrecioVenta());

            return Optional.of(movimientoLinea_Repository.save(movimientoLineaActualizado));
        }
        return Optional.empty();
    }

    @Override
    public Optional<MovimientoLinea_Entity> findById(Long id) {
        return movimientoLinea_Repository.findById(id);
    }

    @Override
    public List<MovimientoLinea_Entity> findByIdMovimiento(Long idMovimiento) {
        return movimientoLinea_Repository.findByIdMovimiento_Id(idMovimiento);
    }
}
