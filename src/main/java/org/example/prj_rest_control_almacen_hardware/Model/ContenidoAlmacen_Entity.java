package org.example.prj_rest_control_almacen_hardware.Model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Entity
@Table(name = "ContenidoAlmacen", schema = "dbo")
public class ContenidoAlmacen_Entity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @NotNull
    @ManyToOne(optional = false)
    @JoinColumn(name = "id_almacen", nullable = false)
    private Almacen_Entity idAlmacen;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "stock", nullable = false)
    private Integer stock;

    @NotNull
    @ManyToOne(optional = false)
    @JoinColumn(name = "id_lote", nullable = false)
    private Lote_Entity idLote;

}