package org.example.prj_rest_control_almacen_hardware.Model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Nationalized;

import java.time.LocalDate;
import java.util.LinkedHashSet;
import java.util.Set;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity
@Table(name = "Usuario", schema = "dbo")
public class Usuario_Entity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @Nationalized
    @Column(name = "nombre", nullable = false)
    private String nombre;

    @Column(name = "clave", length = 200)
    private String clave;

    @Nationalized
    @Column(name = "dni")
    private String dni;

    @Column(name = "fecha_nacimiento")
    private LocalDate fechaNacimiento;

    @OneToMany
    @JoinColumn(name = "id_usuario")
    private Set<Compra_Entity> compras = new LinkedHashSet<>();

    @OneToMany
    @JoinColumn(name = "id_usuario")
    private Set<Movimiento_Entity> movimientos = new LinkedHashSet<>();

    @OneToMany
    @JoinColumn(name = "id_usuario")
    private Set<Venta_Entity> ventas = new LinkedHashSet<>();

}