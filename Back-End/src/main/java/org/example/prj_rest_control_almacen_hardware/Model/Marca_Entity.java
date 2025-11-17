package org.example.prj_rest_control_almacen_hardware.Model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Entity
@Table(name = "Marca", schema = "dbo")
public class Marca_Entity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Size(max = 255)
    @Column(name = "nombre")
    private String nombre;

    @ColumnDefault("1")
    @Column(name = "estado")
    private Boolean estado;

}