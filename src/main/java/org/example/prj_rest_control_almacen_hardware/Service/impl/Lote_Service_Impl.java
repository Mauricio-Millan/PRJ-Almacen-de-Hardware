package org.example.prj_rest_control_almacen_hardware.Service.impl;

import org.example.prj_rest_control_almacen_hardware.DTOs.*;
import org.example.prj_rest_control_almacen_hardware.Model.Lote_Entity;
import org.example.prj_rest_control_almacen_hardware.Repository.Lote_Repository;
import org.example.prj_rest_control_almacen_hardware.Service.Lote_Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.sql.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class Lote_Service_Impl implements Lote_Service {
    @Autowired
    private Lote_Repository lote_Repository;

    @Autowired
    private DataSource dataSource;

    @Override
    public List<Lote_Entity> findAll() {
        return lote_Repository.findAll();
    }

    @Override
    public Lote_Entity save(Lote_Entity lote) {
        return lote_Repository.save(lote);
    }

    @Override
    public String deleteById(Long id) {
        lote_Repository.deleteById(id);
        return "Lote eliminado con éxito";
    }

    @Override
    public Optional<Lote_Entity> update(Long id, Lote_Entity lote) {
        Optional<Lote_Entity> loteExistente = lote_Repository.findById(id);

        if (loteExistente.isPresent()) {
            Lote_Entity loteActualizado = loteExistente.get();
            loteActualizado.setIdCompra(lote.getIdCompra());
            loteActualizado.setCantidad(lote.getCantidad());
            loteActualizado.setPrecioUnit(lote.getPrecioUnit());
            loteActualizado.setFechaExpiracion(lote.getFechaExpiracion());
            loteActualizado.setEstado(lote.getEstado());
            loteActualizado.setIdProducto(lote.getIdProducto());

            return Optional.of(lote_Repository.save(loteActualizado));
        }
        return Optional.empty();
    }

    @Override
    public Optional<Lote_Entity> findById(Long id) {
        return lote_Repository.findById(id);
    }

    @Override
    public List<Lote_Entity> findByIdCompraId(Long idCompra) {
        return lote_Repository.findByIdCompraId(idCompra);
    }

    @Override
    public List<Lote_Entity> findByIdProductoId(Long idProducto) {
        return lote_Repository.findByIdProductoId(idProducto);
    }

    @Override
    public HistorialLoteDTO obtenerHistorialMovimientos(Long idLote) {
        HistorialLoteDTO historial = new HistorialLoteDTO();

        try (Connection conn = dataSource.getConnection();
             CallableStatement stmt = conn.prepareCall("{call PA_ObtenerHistorialMovimientosLote(?)}")) {

            stmt.setLong(1, idLote);

            boolean hasResults = stmt.execute();
            int resultSetCount = 0;

            while (hasResults) {
                try (ResultSet rs = stmt.getResultSet()) {
                    switch (resultSetCount) {
                        case 0: // Información del lote
                            if (rs.next()) {
                                InfoLoteDTO infoLote = new InfoLoteDTO();
                                infoLote.setIdLote(rs.getLong("id_lote"));
                                infoLote.setProducto(rs.getString("producto"));
                                infoLote.setIdProducto(rs.getLong("id_producto"));
                                infoLote.setMarca(rs.getString("marca"));
                                infoLote.setPrecioUnit(rs.getBigDecimal("precio_unit"));

                                Date fechaExp = rs.getDate("fecha_expiracion");
                                if (fechaExp != null) {
                                    infoLote.setFechaExpiracion(fechaExp.toLocalDate());
                                }
                                infoLote.setFechaExpiracionFormato(rs.getString("fecha_expiracion_formato"));
                                infoLote.setCantidadOriginal(rs.getInt("cantidad_original"));
                                infoLote.setIdCompra(rs.getLong("id_compra"));

                                Date fechaCompra = rs.getDate("fecha_compra");
                                if (fechaCompra != null) {
                                    infoLote.setFechaCompra(fechaCompra.toLocalDate());
                                }
                                infoLote.setFechaCompraFormato(rs.getString("fecha_compra_formato"));
                                infoLote.setProveedor(rs.getString("proveedor"));

                                historial.setInfoLote(infoLote);
                            }
                            break;

                        case 1: // Historial de movimientos
                            List<MovimientoDetalleDTO> movimientos = new ArrayList<>();
                            while (rs.next()) {
                                MovimientoDetalleDTO mov = new MovimientoDetalleDTO();
                                mov.setSecuencia(rs.getInt("secuencia"));
                                mov.setIdMovimientoLinea(rs.getLong("id_movimiento_linea"));
                                mov.setIdMovimiento(rs.getLong("id_movimiento"));

                                Timestamp fechaMov = rs.getTimestamp("fecha_movimiento");
                                if (fechaMov != null) {
                                    mov.setFechaMovimiento(fechaMov.toLocalDateTime());
                                }
                                mov.setFechaMovimientoFormato(rs.getString("fecha_movimiento_formato"));
                                mov.setTipoAccion(rs.getString("tipo_accion"));
                                mov.setIdTipoAccion(rs.getLong("id_tipo_accion"));
                                mov.setUsuario(rs.getString("usuario"));
                                mov.setIdUsuario(rs.getLong("id_usuario"));
                                mov.setCantidadMovida(rs.getInt("cantidad_movida"));
                                mov.setCantidadConSigno(rs.getInt("cantidad_con_signo"));
                                mov.setAlmacenOrigen(rs.getString("almacen_origen"));

                                Long idAlmOrigen = rs.getLong("id_almacen_origen");
                                if (!rs.wasNull()) {
                                    mov.setIdAlmacenOrigen(idAlmOrigen);
                                }

                                mov.setAlmacenDestino(rs.getString("almacen_destino"));

                                Long idAlmDestino = rs.getLong("id_almacen_destino");
                                if (!rs.wasNull()) {
                                    mov.setIdAlmacenDestino(idAlmDestino);
                                }

                                mov.setTipoMovimiento(rs.getString("tipo_movimiento"));
                                mov.setReferencia(rs.getString("referencia"));
                                mov.setComentario(rs.getString("comentario"));

                                Timestamp fechaReg = rs.getTimestamp("fecha_registro");
                                if (fechaReg != null) {
                                    mov.setFechaRegistro(fechaReg.toLocalDateTime());
                                }
                                mov.setFechaRegistroFormato(rs.getString("fecha_registro_formato"));

                                movimientos.add(mov);
                            }
                            historial.setHistorialMovimientos(movimientos);
                            break;

                        case 2: // Ubicaciones actuales
                            List<UbicacionStockDTO> ubicaciones = new ArrayList<>();
                            while (rs.next()) {
                                UbicacionStockDTO ubic = new UbicacionStockDTO();
                                ubic.setIdAlmacen(rs.getLong("id_almacen"));
                                ubic.setAlmacen(rs.getString("almacen"));
                                ubic.setStockActual(rs.getInt("stock_actual"));
                                ubic.setValorTotal(rs.getBigDecimal("valor_total"));
                                ubic.setEstadoStock(rs.getString("estado_stock"));
                                ubicaciones.add(ubic);
                            }
                            historial.setUbicacionesActuales(ubicaciones);
                            break;

                        case 3: // Balance de movimientos
                            if (rs.next()) {
                                BalanceMovimientosDTO balance = new BalanceMovimientosDTO();
                                balance.setTotalEntradas(rs.getInt("total_entradas"));
                                balance.setTotalSalidas(rs.getInt("total_salidas"));
                                balance.setTotalAjustes(rs.getInt("total_ajustes"));
                                balance.setStockActual(rs.getInt("stock_actual"));
                                balance.setBalanceCalculado(rs.getInt("balance_calculado"));
                                balance.setEstadoBalance(rs.getString("estado_balance"));
                                historial.setBalance(balance);
                            }
                            break;
                    }
                }

                hasResults = stmt.getMoreResults();
                resultSetCount++;
            }

        } catch (SQLException e) {
            throw new RuntimeException("Error al obtener historial de movimientos del lote: " + e.getMessage(), e);
        }

        return historial;
    }
}
