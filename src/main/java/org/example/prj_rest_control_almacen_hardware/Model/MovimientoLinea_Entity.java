package org.example.prj_rest_control_almacen_hardware.Model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity
@Table(name = "MovimientoLinea", schema = "dbo")
public class MovimientoLinea_Entity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_movimiento", nullable = false)
    private Movimiento_Entity idMovimiento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_almacen_origen")
    private Almacen_Entity idAlmacenOrigen;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_almacen_destino")
    private Almacen_Entity idAlmacenDestino;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_lote", nullable = false)
    private Lote_Entity idLote;

    @Column(name = "cantidad_delta", nullable = false, precision = 18)
    private BigDecimal cantidadDelta;

    @Column(name = "Precio_Venta", precision = 18)
    private BigDecimal precioVenta;

}