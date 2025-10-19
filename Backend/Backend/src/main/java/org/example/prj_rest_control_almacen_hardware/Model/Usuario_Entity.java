package org.example.prj_rest_control_almacen_hardware.Model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

import java.time.LocalDate;


@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
@Entity
@Table(name = "Usuario", schema = "dbo")
public class Usuario_Entity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Size(max = 255)
    @NotNull
    @Column(name = "nombre", nullable = false)
    private String nombre;

    @Size(max = 200)
    @Column(name = "clave", length = 200)
    private String clave;

    @Size(max = 8)
    @Column(name = "dni", length = 8)
    private String dni;

    @Column(name = "fecha_nacimiento")
    private LocalDate fechaNacimiento;

    @NotNull
    @ManyToOne( optional = false)
    @JoinColumn(name = "id_rol", nullable = false)
    private Roles_Entity idRol;

    @ColumnDefault("1")
    @Column(name = "estado")
    private Boolean estado;

}