package org.example.prj_rest_control_almacen_hardware.Model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Entity
@Table(name = "Almacen", schema = "dbo")
public class Almacen_Entity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @Size(max = 255)
    @NotNull
    @Column(name = "nombre", nullable = false)
    private String nombre;

    @Size(max = 255)
    @Column(name = "direccion")
    private String direccion;

    @Size(max = 13)
    @Column(name = "telefono", length = 13)
    private String telefono;

}