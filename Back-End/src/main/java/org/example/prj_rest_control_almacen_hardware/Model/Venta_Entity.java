package org.example.prj_rest_control_almacen_hardware.Model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

import java.time.LocalDate;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Entity
@Table(name = "Venta", schema = "dbo")
public class Venta_Entity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_usuario")
    private Usuario_Entity idUsuario;

    @ManyToOne
    @JoinColumn(name = "id_movimiento")
    private Movimiento_Entity idMovimiento;

    @ManyToOne
    @JoinColumn(name = "id_cliente")
    private Cliente_Entity idCliente;

    @Column(name = "fecha")
    private LocalDate fecha;

    @ColumnDefault("1")
    @Column(name = "estado")
    private Boolean estado;

}