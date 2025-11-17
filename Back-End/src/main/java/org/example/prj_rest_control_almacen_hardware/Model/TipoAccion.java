package org.example.prj_rest_control_almacen_hardware.Model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "\"TipoAccion\"", schema = "dbo")
public class TipoAccion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @Size(max = 120)
    @NotNull
    @Column(name = "nombre", nullable = false, length = 120)
    private String nombre;

}