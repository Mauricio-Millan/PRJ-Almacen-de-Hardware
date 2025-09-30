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
@Table(name = "Proveedor", schema = "dbo")
public class Proveedor_Entity {
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
    @JoinColumn(name = "id_proveedor")
    private Set<Compra_Entity> compras = new LinkedHashSet<>();

}