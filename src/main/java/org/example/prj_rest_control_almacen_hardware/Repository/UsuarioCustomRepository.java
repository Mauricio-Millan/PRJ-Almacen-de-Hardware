package org.example.prj_rest_control_almacen_hardware.Repository;

import org.example.prj_rest_control_almacen_hardware.DTOs.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Types;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Repository
public class UsuarioCustomRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public LineaTiempoUsuarioDTO obtenerLineaTiempoUsuario(
            Integer idUsuario,
            LocalDateTime fechaDesde,
            LocalDateTime fechaHasta,
            Integer idTipoAccion) {

        return jdbcTemplate.execute(
            (Connection con) -> {
                CallableStatement cs = con.prepareCall("{CALL PA_ObtenerLineaTiempoUsuario(?, ?, ?, ?)}");

                cs.setInt(1, idUsuario);

                if (fechaDesde != null) {
                    cs.setTimestamp(2, Timestamp.valueOf(fechaDesde));
                } else {
                    cs.setNull(2, Types.TIMESTAMP);
                }

                if (fechaHasta != null) {
                    cs.setTimestamp(3, Timestamp.valueOf(fechaHasta));
                } else {
                    cs.setNull(3, Types.TIMESTAMP);
                }

                if (idTipoAccion != null) {
                    cs.setInt(4, idTipoAccion);
                } else {
                    cs.setNull(4, Types.INTEGER);
                }

                boolean hasResults = cs.execute();
                LineaTiempoUsuarioDTO resultado = new LineaTiempoUsuarioDTO();

                // ResultSet 1: Información del usuario
                if (hasResults) {
                    try (ResultSet rs = cs.getResultSet()) {
                        if (rs.next()) {
                            UsuarioInfoDTO info = new UsuarioInfoDTO();
                            info.setIdUsuario(rs.getInt("ID_Usuario"));
                            info.setNombreUsuario(rs.getString("Nombre_Usuario"));
                            info.setDni(rs.getString("DNI"));
                            info.setRol(rs.getString("Rol"));
                            resultado.setInformacionUsuario(info);
                        }
                    }
                }

                // ResultSet 2: Línea de tiempo detallada
                if (cs.getMoreResults()) {
                    try (ResultSet rs = cs.getResultSet()) {
                        List<LineaTiempoDetalleDTO> lineaTiempo = new ArrayList<>();
                        while (rs.next()) {
                            LineaTiempoDetalleDTO detalle = new LineaTiempoDetalleDTO();
                            detalle.setIdMovimiento(rs.getInt("ID_Movimiento"));
                            detalle.setFechaHora(rs.getString("Fecha_Hora"));
                            detalle.setIdTipoAccion(rs.getInt("ID_Tipo_Accion"));
                            detalle.setTipoAccion(rs.getString("Tipo_Accion"));
                            detalle.setReferencia(rs.getString("Referencia"));
                            detalle.setComentario(rs.getString("Comentario"));
                            detalle.setIdMovimientoLinea(rs.getInt("ID_Movimiento_Linea"));
                            detalle.setCantidad(rs.getInt("Cantidad"));
                            detalle.setPrecioVenta(rs.getBigDecimal("Precio_Venta"));
                            detalle.setIdLote(rs.getInt("ID_Lote"));
                            detalle.setIdProducto(rs.getInt("ID_Producto"));
                            detalle.setNombreProducto(rs.getString("Nombre_Producto"));
                            detalle.setMarca(rs.getString("Marca"));
                            detalle.setPrecioUnitarioLote(rs.getBigDecimal("Precio_Unitario_Lote"));
                            detalle.setIdAlmacenOrigen((Integer) rs.getObject("ID_Almacen_Origen"));
                            detalle.setAlmacenOrigen(rs.getString("Almacen_Origen"));
                            detalle.setIdAlmacenDestino((Integer) rs.getObject("ID_Almacen_Destino"));
                            detalle.setAlmacenDestino(rs.getString("Almacen_Destino"));
                            detalle.setDescripcionAccion(rs.getString("Descripcion_Accion"));
                            detalle.setFechaRegistro(rs.getString("Fecha_Registro"));
                            detalle.setTipoFlujo(rs.getString("Tipo_Flujo"));
                            lineaTiempo.add(detalle);
                        }
                        resultado.setLineaTiempo(lineaTiempo);
                    }
                }

                // ResultSet 3: Resumen estadístico
                if (cs.getMoreResults()) {
                    try (ResultSet rs = cs.getResultSet()) {
                        if (rs.next()) {
                            ResumenUsuarioDTO resumen = new ResumenUsuarioDTO();
                            resumen.setTotalMovimientos(rs.getInt("Total_Movimientos"));
                            resumen.setTotalAbastecimientos(rs.getInt("Total_Abastecimientos"));
                            resumen.setTotalTraslados(rs.getInt("Total_Traslados"));
                            resumen.setTotalAjustes(rs.getInt("Total_Ajustes"));
                            resumen.setTotalVentas(rs.getInt("Total_Ventas"));
                            resumen.setTotalUnidadesAbastecidas(rs.getInt("Total_Unidades_Abastecidas"));
                            resumen.setTotalUnidadesTrasladadas(rs.getInt("Total_Unidades_Trasladadas"));
                            resumen.setTotalUnidadesVendidas(rs.getInt("Total_Unidades_Vendidas"));
                            resumen.setTotalIngresosVentas(rs.getBigDecimal("Total_Ingresos_Ventas"));

                            Timestamp primeraAccion = rs.getTimestamp("Primera_Accion");
                            Timestamp ultimaAccion = rs.getTimestamp("Ultima_Accion");

                            resumen.setPrimeraAccion(primeraAccion != null ? primeraAccion.toString() : null);
                            resumen.setUltimaAccion(ultimaAccion != null ? ultimaAccion.toString() : null);
                            resultado.setResumen(resumen);
                        }
                    }
                }

                // ResultSet 4: Top 10 productos más manejados
                if (cs.getMoreResults()) {
                    try (ResultSet rs = cs.getResultSet()) {
                        List<TopProductoUsuarioDTO> topProductos = new ArrayList<>();
                        while (rs.next()) {
                            TopProductoUsuarioDTO producto = new TopProductoUsuarioDTO();
                            producto.setIdProducto(rs.getInt("ID_Producto"));
                            producto.setNombreProducto(rs.getString("Nombre_Producto"));
                            producto.setMarca(rs.getString("Marca"));
                            producto.setCantidadMovimientos(rs.getInt("Cantidad_Movimientos"));
                            producto.setTotalUnidadesManejadas(rs.getInt("Total_Unidades_Manejadas"));
                            topProductos.add(producto);
                        }
                        resultado.setTopProductos(topProductos);
                    }
                }

                // ResultSet 5: Almacenes más utilizados
                if (cs.getMoreResults()) {
                    try (ResultSet rs = cs.getResultSet()) {
                        List<AlmacenUtilizadoDTO> almacenes = new ArrayList<>();
                        while (rs.next()) {
                            AlmacenUtilizadoDTO almacen = new AlmacenUtilizadoDTO();
                            almacen.setIdAlmacen(rs.getInt("ID_Almacen"));
                            almacen.setNombreAlmacen(rs.getString("Nombre_Almacen"));
                            almacen.setCantidadOperaciones(rs.getInt("Cantidad_Operaciones"));
                            almacen.setOperacionesComoOrigen(rs.getInt("Operaciones_Como_Origen"));
                            almacen.setOperacionesComoDestino(rs.getInt("Operaciones_Como_Destino"));
                            almacenes.add(almacen);
                        }
                        resultado.setAlmacenesUtilizados(almacenes);
                    }
                }

                return resultado;
            }
        );
    }
}

