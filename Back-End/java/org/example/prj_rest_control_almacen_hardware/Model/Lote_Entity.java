package org.example.prj_rest_control_almacen_hardware.Model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.LinkedHashSet;
import java.util.Set;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity
@Table(name = "Lote", schema = "dbo")
public class Lote_Entity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_producto", nullable = false)
    private Producto_Entity idProducto;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_compra", nullable = false)
    private Compra_Entity idCompra;

    @Column(name = "cantidad")
    private String cantidad;

    @Column(name = "precio_unit", precision = 18)
    private BigDecimal precioUnit;

    @Column(name = "fecha_expiracion")
    private LocalDate fechaExpiracion;

    @OneToMany
    @JoinColumn(name = "id_lote")
    private Set<ContenidoAlmacen_Entity> contenidoAlmacens = new LinkedHashSet<>();

    @OneToMany
    @JoinColumn(name = "id_lote")
    private Set<MovimientoLinea_Entity> movimientoLineas = new LinkedHashSet<>();

}