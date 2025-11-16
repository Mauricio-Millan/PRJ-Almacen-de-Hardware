package org.example.prj_rest_control_almacen_hardware.Model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

import java.math.BigDecimal;
import java.time.LocalDate;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Entity
@Table(name = "Lote", schema = "dbo")
public class Lote_Entity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @NotNull
    @ManyToOne(optional = false)
    @JoinColumn(name = "id_compra", nullable = false)
    private Compra_Entity idCompra;

    @NotNull
    @Column(name = "cantidad", nullable = false)
    private Integer cantidad;

    @Column(name = "precio_unit", precision = 18)
    private BigDecimal precioUnit;

    @Column(name = "fecha_expiracion")
    private LocalDate fechaExpiracion;

    @ColumnDefault("1")
    @Column(name = "estado")
    private Boolean estado;

    @NotNull
    @ManyToOne(optional = false)
    @JoinColumn(name = "id_producto", nullable = false)
    private Producto_Entity idProducto;

}