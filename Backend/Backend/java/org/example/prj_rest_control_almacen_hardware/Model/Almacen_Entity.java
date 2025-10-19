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
@Table(name = "Almacen", schema = "dbo")
public class Almacen_Entity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @Nationalized
    @Column(name = "nombre", nullable = false)
    private String nombre;

    @Nationalized
    @Column(name = "direccion")
    private String direccion;

    @Nationalized
    @Column(name = "telefono")
    private String telefono;

    @OneToMany
    @JoinColumn(name = "id_almacen")
    private Set<ContenidoAlmacen_Entity> contenidoAlmacens = new LinkedHashSet<>();

    @OneToMany
    @JoinColumn(name = "id_almacen_origen")
    private Set<MovimientoLinea_Entity> movimientoLineas = new LinkedHashSet<>();

}