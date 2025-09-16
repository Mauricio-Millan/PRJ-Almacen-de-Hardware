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
@Table(name = "TipoAccion", schema = "dbo")
public class TipoAccion_Entity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @Nationalized
    @Column(name = "nombre", nullable = false)
    private String nombre;

    @OneToMany
    @JoinColumn(name = "id_tipo_accion")
    private Set<Movimiento_Entity> movimientos = new LinkedHashSet<>();

}