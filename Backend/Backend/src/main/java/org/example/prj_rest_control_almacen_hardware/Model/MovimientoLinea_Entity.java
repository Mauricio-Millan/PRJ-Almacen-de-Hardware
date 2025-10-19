package org.example.prj_rest_control_almacen_hardware.Model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Entity
@Table(name = "MovimientoLinea", schema = "dbo")
public class MovimientoLinea_Entity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @NotNull
    @ManyToOne( optional = false)
    @JoinColumn(name = "id_movimiento", nullable = false)
    private Movimiento_Entity idMovimiento;

    @ManyToOne
    @JoinColumn(name = "id_almacen_origen")
    private Almacen_Entity idAlmacenOrigen;

    @ManyToOne
    @JoinColumn(name = "id_almacen_destino")
    private Almacen_Entity idAlmacenDestino;

    @NotNull
    @ManyToOne(optional = false)
    @JoinColumn(name = "id_lote", nullable = false)
    private Lote_Entity idLote;

    @NotNull
    @Column(name = "cantidad_delta", nullable = false)
    private Integer cantidadDelta;

    @Column(name = "Precio_Venta", precision = 18)
    private BigDecimal precioVenta;

}