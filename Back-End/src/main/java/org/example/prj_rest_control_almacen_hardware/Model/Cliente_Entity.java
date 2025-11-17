package org.example.prj_rest_control_almacen_hardware.Model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Entity
@Table(name = "Cliente", schema = "dbo")
public class Cliente_Entity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @Size(max = 255)
    @Column(name = "nombre")
    private String nombre;

    @Size(max = 11)
    @Column(name = "ruc", columnDefinition = "char")
    private String ruc;

    @Size(max = 13)
    @Column(name = "telefono")
    private String telefono;

    @ColumnDefault("1")
    @Column(name = "estado")
    private Boolean estado;

}