package org.example.prj_rest_control_almacen_hardware.Model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Date;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Entity
@Table(name = "Movimiento", schema = "dbo")
public class Movimiento_Entity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @NotNull
    @Column(name = "fecha", nullable = false)
    private Instant fecha;

    @Size(max = 255)
    @Column(name = "referencia")
    private String referencia;

    @Size(max = 255)
    @Column(name = "comentario")
    private String comentario;

    @NotNull
    @ColumnDefault("getdate()")
    @Column(name = "created_at", nullable = false,columnDefinition = "datetime")
    private Date createdAt;

    @ColumnDefault("1")
    @Column(name = "estado")
    private Boolean estado;

    @NotNull
    @ManyToOne(optional = false)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario_Entity idUsuario;

    @NotNull
    @ManyToOne(optional = false)
    @JoinColumn(name = "id_tipo_accion", nullable = false)
    private TipoAccion_Entity idTipoAccion;

}