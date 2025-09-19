package org.example.prj_rest_control_almacen_hardware.Model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Nationalized;

import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.Set;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity
@Table(name = "Movimiento", schema = "dbo")
public class Movimiento_Entity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @Column(name = "fecha", nullable = false)
    private Instant fecha;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario_Entity idUsuario;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_tipo_accion", nullable = false)
    private TipoAccion_Entity idTipoAccion;

    @Nationalized
    @Column(name = "referencia")
    private String referencia;

    @Nationalized
    @Column(name = "comentario")
    private String comentario;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @OneToMany
    @JoinColumn(name = "id_movimiento")
    private Set<Compra_Entity> compras = new LinkedHashSet<>();

    @OneToMany
    @JoinColumn(name = "id_movimiento")
    private Set<MovimientoLinea_Entity> movimientoLineas = new LinkedHashSet<>();

    @OneToMany
    @JoinColumn(name = "id_movimiento")
    private Set<Venta_Entity> ventas = new LinkedHashSet<>();

}