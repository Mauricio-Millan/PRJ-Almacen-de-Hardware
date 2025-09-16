package org.example.prj_rest_control_almacen_hardware.Model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Nationalized;

import java.util.LinkedHashSet;
import java.util.Set;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity
@Table(name = "Cliente", schema = "dbo")
public class Cliente_Entity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @Nationalized
    @Column(name = "nombre")
    private String nombre;

    @Nationalized
    @Column(name = "ruc")
    private String ruc;

    @Nationalized
    @Column(name = "telefono")
    private String telefono;

    @OneToMany
    @JoinColumn(name = "id_cliente")
    private Set<Venta_Entity> ventas = new LinkedHashSet<>();

}