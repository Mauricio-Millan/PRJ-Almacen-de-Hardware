package org.example.prj_rest_control_almacen_hardware.Model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "Compra", schema = "dbo")
public class Compra_Entity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "fecha")
    private Instant fecha;

    @ColumnDefault("1")
    @Column(name = "estado")
    private Boolean estado;

    @ManyToOne
    @JoinColumn(name = "id_usuario")
    private Usuario_Entity idUsuario;

    @ManyToOne
    @JoinColumn(name = "id_movimiento")
    private Movimiento_Entity idMovimiento;

    @ManyToOne
    @JoinColumn(name = "id_proveedor")
    private Proveedor_Entity idProveedor;

}