package org.example.prj_rest_control_almacen_hardware.Repository;

import org.example.prj_rest_control_almacen_hardware.DTOs.AlmacenInfoDTO;
import org.example.prj_rest_control_almacen_hardware.DTOs.ConsultaAlmacenDetalladoDTO;
import org.example.prj_rest_control_almacen_hardware.DTOs.DetalleProductoDTO;
import org.example.prj_rest_control_almacen_hardware.DTOs.ResumenAlmacenDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Types;
import java.util.ArrayList;
import java.util.List;

@Repository
public class AlmacenCustomRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public ConsultaAlmacenDetalladoDTO consultarContenidoDetallado(Integer idAlmacen, String nombreProducto) {
        return jdbcTemplate.execute(
            (Connection con) -> {
                CallableStatement cs = con.prepareCall("{CALL PA_ConsultarContenidoAlmacenDetallado(?, ?)}");

                cs.setInt(1, idAlmacen);
                if (nombreProducto != null && !nombreProducto.trim().isEmpty()) {
                    cs.setString(2, nombreProducto);
                } else {
                    cs.setNull(2, Types.VARCHAR);
                }

                boolean hasResults = cs.execute();
                ConsultaAlmacenDetalladoDTO resultado = new ConsultaAlmacenDetalladoDTO();

                // Primer ResultSet: Información del almacén
                if (hasResults) {
                    try (ResultSet rs = cs.getResultSet()) {
                        if (rs.next()) {
                            AlmacenInfoDTO info = new AlmacenInfoDTO();
                            info.setIdAlmacen(rs.getInt("ID_Almacen"));
                            info.setNombreAlmacen(rs.getString("Nombre_Almacen"));
                            info.setDireccion(rs.getString("Direccion"));
                            info.setTelefono(rs.getString("Telefono"));
                            resultado.setInformacion(info);
                        }
                    }
                }

                // Segundo ResultSet: Detalle de productos
                if (cs.getMoreResults()) {
                    try (ResultSet rs = cs.getResultSet()) {
                        List<DetalleProductoDTO> productos = new ArrayList<>();
                        while (rs.next()) {
                            DetalleProductoDTO detalle = new DetalleProductoDTO();
                            detalle.setIdContenidoAlmacen(rs.getInt("ID_ContenidoAlmacen"));
                            detalle.setIdProducto(rs.getInt("ID_Producto"));
                            detalle.setNombreProducto(rs.getString("Nombre_Producto"));
                            detalle.setMarca(rs.getString("Marca"));
                            detalle.setNumeroLote(rs.getInt("Numero_Lote"));
                            detalle.setPrecioUnitario(rs.getBigDecimal("Precio_Unitario"));
                            detalle.setFechaExpiracion(rs.getString("Fecha_Expiracion"));
                            detalle.setCantidadLote(rs.getInt("Cantidad_Lote"));
                            detalle.setStockActual(rs.getInt("Stock_Actual"));
                            detalle.setEstadoStock(rs.getString("Estado_Stock"));
                            productos.add(detalle);
                        }
                        resultado.setProductos(productos);
                    }
                }

                // Tercer ResultSet: Resumen estadístico
                if (cs.getMoreResults()) {
                    try (ResultSet rs = cs.getResultSet()) {
                        if (rs.next()) {
                            ResumenAlmacenDTO resumen = new ResumenAlmacenDTO();
                            resumen.setTotalProductosDistintos(rs.getInt("Total_Productos_Distintos"));
                            resumen.setTotalLotes(rs.getInt("Total_Lotes"));
                            resumen.setTotalUnidades(rs.getInt("Total_Unidades"));
                            resumen.setValorTotalInventario(rs.getBigDecimal("Valor_Total_Inventario"));
                            resumen.setLotesSinStock(rs.getInt("Lotes_Sin_Stock"));
                            resumen.setLotesConStock(rs.getInt("Lotes_Con_Stock"));
                            resultado.setResumen(resumen);
                        }
                    }
                }

                return resultado;
            }
        );
    }
}

