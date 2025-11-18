package org.example.prj_rest_control_almacen_hardware.Service.impl;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.example.prj_rest_control_almacen_hardware.DTOs.CrearMovimientoLineaDTO;
import org.example.prj_rest_control_almacen_hardware.DTOs.GenerarMovimientoDTO;
import org.example.prj_rest_control_almacen_hardware.DTOs.LineaMovimientoDTO;
import org.example.prj_rest_control_almacen_hardware.Model.*;
import org.example.prj_rest_control_almacen_hardware.Repository.*;
import org.example.prj_rest_control_almacen_hardware.Service.Movimiento_Service;
import org.example.prj_rest_control_almacen_hardware.Service.MovimientoLinea_Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class Movimiento_Service_Impl implements Movimiento_Service {

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    private Movimiento_Repository movimiento_Repository;

    @Autowired
    private MovimientoLinea_Service movimientoLinea_Service;

    @Autowired
    private Compra_Repository compra_Repository;

    @Autowired
    private Venta_Repository venta_Repository;

    @Autowired
    private Lote_Repository lote_Repository;

    @Autowired
    private Usuario_Repository usuario_Repository;

    @Autowired
    private TipoAccionRepository tipoAccion_Repository;

    @Autowired
    private Producto_Repository producto_Repository;

    @Autowired
    private Proveedor_Repository proveedor_Repository;

    @Autowired
    private Cliente_Repository cliente_Repository;

    @Override
    public List<Movimiento_Entity> findAll() {
        return movimiento_Repository.findAll();
    }

    @Override
    public Movimiento_Entity save(Movimiento_Entity movimiento) {
        return movimiento_Repository.save(movimiento);
    }

    @Override
    public String deleteById(Long id) {
        movimiento_Repository.deleteById(id);
        return "Movimiento eliminado con éxito";
    }

    @Override
    public Optional<Movimiento_Entity> update(Long id, Movimiento_Entity movimiento) {
        Optional<Movimiento_Entity> movimientoExistente = movimiento_Repository.findById(id);

        if (movimientoExistente.isPresent()) {
            Movimiento_Entity movimientoActualizado = movimientoExistente.get();
            movimientoActualizado.setFecha(movimiento.getFecha());
            movimientoActualizado.setIdUsuario(movimiento.getIdUsuario());
            movimientoActualizado.setIdTipoAccion(movimiento.getIdTipoAccion());
            movimientoActualizado.setReferencia(movimiento.getReferencia());
            movimientoActualizado.setComentario(movimiento.getComentario());
            movimientoActualizado.setCreatedAt(movimiento.getCreatedAt());

            return Optional.of(movimiento_Repository.save(movimientoActualizado));
        }
        return Optional.empty();
    }

    @Override
    public Optional<Movimiento_Entity> findById(Long id) {
        return movimiento_Repository.findById(id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Movimiento_Entity generarMovimiento(GenerarMovimientoDTO dto) throws Exception {
        try {
            // DEBUG - Imprimir datos recibidos
            System.out.println("=== DEBUG: Datos recibidos ===");
            System.out.println("idUsuario: " + dto.getIdUsuario());
            System.out.println("idTipoAccion: " + dto.getIdTipoAccion());
            System.out.println("Cantidad de líneas: " + (dto.getLineas() != null ? dto.getLineas().size() : 0));
            System.out.println("===========================");

            // 1. Validar datos básicos requeridos
            if (dto.getIdUsuario() == null || dto.getIdTipoAccion() == null) {
                throw new Exception("Usuario y Tipo de Acción son obligatorios");
            }

            if (dto.getLineas() == null || dto.getLineas().isEmpty()) {
                throw new Exception("Debe incluir al menos una línea de movimiento");
            }

            // Obtener entidades relacionadas
            System.out.println("DEBUG: Buscando usuario con ID: " + dto.getIdUsuario());
            Usuario_Entity usuario = usuario_Repository.findById(dto.getIdUsuario())
                .orElseThrow(() -> new Exception("Usuario no encontrado"));
            System.out.println("DEBUG: Usuario encontrado: " + usuario.getNombre());

            System.out.println("DEBUG: Buscando tipo acción con ID: " + dto.getIdTipoAccion());
            TipoAccion_Entity tipoAccion = tipoAccion_Repository.findById(dto.getIdTipoAccion())
                .orElseThrow(() -> new Exception("Tipo de Acción no encontrado"));
            System.out.println("DEBUG: Tipo acción encontrado: " + tipoAccion.getNombre());

            // 2. Crear el Movimiento (cabecera)
            System.out.println("DEBUG: Creando movimiento...");
            Movimiento_Entity movimiento = new Movimiento_Entity();
            movimiento.setFecha(dto.getFecha());
            movimiento.setReferencia(dto.getReferencia());
            movimiento.setComentario(dto.getComentario());
            movimiento.setCreatedAt(new Date());
            movimiento.setEstado(true);
            movimiento.setIdUsuario(usuario);
            movimiento.setIdTipoAccion(tipoAccion);

            movimiento = movimiento_Repository.save(movimiento);
            System.out.println("DEBUG: Movimiento creado con ID: " + movimiento.getId());

            // 3. Procesar cada línea según el tipo de movimiento
            Long idTipo = dto.getIdTipoAccion();

            for (int i = 0; i < dto.getLineas().size(); i++) {
                LineaMovimientoDTO lineaDTO = dto.getLineas().get(i);
                System.out.println("DEBUG: Procesando línea " + (i + 1) + " de " + dto.getLineas().size());

                Lote_Entity lote;

                if (idTipo == 1) {
                    // ABASTECIMIENTO (Compra)
                    lote = procesarAbastecimientoLinea(lineaDTO, dto, movimiento, usuario);
                } else if (idTipo == 4) {
                    // VENTA
                    lote = procesarVentaLinea(lineaDTO, dto, movimiento, usuario);
                } else if (idTipo == 2) {
                    // TRANSFERENCIA
                    lote = procesarTransferenciaLinea(lineaDTO);
                } else if (idTipo == 3) {
                    // AJUSTE
                    lote = procesarAjusteLinea(lineaDTO);
                } else {
                    throw new Exception("Tipo de acción no válido");
                }

                // Crear la línea de movimiento
                crearMovimientoLineaDesdeDTO(lineaDTO, movimiento, lote);
                System.out.println("DEBUG: Línea " + (i + 1) + " procesada exitosamente");
            }

            System.out.println("DEBUG: Movimiento completo generado exitosamente");
            return movimiento;

        } catch (Exception e) {
            System.err.println("ERROR: " + e.getMessage());
            System.err.println("ERROR Stack Trace: " + e.getClass().getName());
            throw new Exception("Error al generar movimiento: " + e.getMessage(), e);
        }
    }

    /**
     * Procesa una línea de abastecimiento (compra) creando el lote
     */
    private Lote_Entity procesarAbastecimientoLinea(LineaMovimientoDTO lineaDTO, GenerarMovimientoDTO dto,
                                                     Movimiento_Entity movimiento, Usuario_Entity usuario) throws Exception {
        // Validar datos específicos de la línea
        if (lineaDTO.getIdAlmacenOrigen() != null) {
            throw new Exception("En abastecimientos el almacén origen debe ser null");
        }
        if (lineaDTO.getIdAlmacenDestino() == null) {
            throw new Exception("En abastecimientos el almacén destino es obligatorio");
        }
        if (lineaDTO.getIdProducto() == null) {
            throw new Exception("El producto es obligatorio en abastecimientos");
        }
        if (lineaDTO.getCantidadLote() == null || lineaDTO.getCantidadLote() <= 0) {
            throw new Exception("La cantidad del lote debe ser mayor a 0");
        }

        // Validar proveedor (solo una vez por movimiento)
        if (dto.getIdProveedor() == null) {
            throw new Exception("El proveedor es obligatorio en abastecimientos");
        }

        // Verificar si ya existe la compra o crearla
        Compra_Entity compra = compra_Repository.findByIdMovimiento(movimiento)
            .orElseGet(() -> {
                try {
                    Proveedor_Entity proveedor = proveedor_Repository.findById(dto.getIdProveedor())
                        .orElseThrow(() -> new Exception("Proveedor no encontrado"));

                    Compra_Entity nuevaCompra = new Compra_Entity();
                    nuevaCompra.setFecha(movimiento.getFecha());
                    nuevaCompra.setEstado(true);
                    nuevaCompra.setIdUsuario(usuario);
                    nuevaCompra.setIdMovimiento(movimiento);
                    nuevaCompra.setIdProveedor(proveedor);
                    return compra_Repository.save(nuevaCompra);
                } catch (Exception e) {
                    throw new RuntimeException(e);
                }
            });

        // Crear el lote
        Producto_Entity producto = producto_Repository.findById(lineaDTO.getIdProducto().intValue())
            .orElseThrow(() -> new Exception("Producto no encontrado con ID: " + lineaDTO.getIdProducto()));

        Lote_Entity lote = new Lote_Entity();
        lote.setIdCompra(compra);
        lote.setCantidad(lineaDTO.getCantidadLote());
        lote.setPrecioUnit(lineaDTO.getPrecioUnitario());
        lote.setFechaExpiracion(lineaDTO.getFechaExpiracion());
        lote.setEstado(true);
        lote.setIdProducto(producto);
        lote = lote_Repository.save(lote);

        System.out.println("DEBUG: Lote creado con ID: " + lote.getId());
        return lote;
    }

    /**
     * Procesa una línea de venta
     */
    private Lote_Entity procesarVentaLinea(LineaMovimientoDTO lineaDTO, GenerarMovimientoDTO dto,
                                           Movimiento_Entity movimiento, Usuario_Entity usuario) throws Exception {
        // Validar datos específicos de la línea
        if (lineaDTO.getIdAlmacenDestino() != null) {
            throw new Exception("En ventas el almacén destino debe ser null");
        }
        if (lineaDTO.getIdAlmacenOrigen() == null) {
            throw new Exception("En ventas el almacén origen es obligatorio");
        }
        if (lineaDTO.getIdLoteExistente() == null) {
            throw new Exception("El lote es obligatorio en ventas");
        }
        if (lineaDTO.getPrecioVenta() == null) {
            throw new Exception("El precio de venta es obligatorio");
        }

        // Validar cliente (solo una vez por movimiento)
        if (dto.getIdCliente() == null) {
            throw new Exception("El cliente es obligatorio en ventas");
        }

        // Verificar si ya existe la venta o crearla
        venta_Repository.findByIdMovimiento(movimiento)
            .orElseGet(() -> {
                try {
                    Cliente_Entity cliente = cliente_Repository.findById(dto.getIdCliente())
                        .orElseThrow(() -> new Exception("Cliente no encontrado"));

                    Venta_Entity nuevaVenta = new Venta_Entity();
                    nuevaVenta.setIdUsuario(usuario);
                    nuevaVenta.setIdMovimiento(movimiento);
                    nuevaVenta.setIdCliente(cliente);
                    nuevaVenta.setFecha(Instant.now());
                    nuevaVenta.setEstado(true);
                    return venta_Repository.save(nuevaVenta);
                } catch (Exception e) {
                    throw new RuntimeException(e);
                }
            });

        // Obtener el lote existente y retornarlo
        return lote_Repository.findById(lineaDTO.getIdLoteExistente())
            .orElseThrow(() -> new Exception("Lote no encontrado"));
    }

    /**
     * Procesa una línea de transferencia
     */
    private Lote_Entity procesarTransferenciaLinea(LineaMovimientoDTO lineaDTO) throws Exception {
        // Validar datos específicos
        if (lineaDTO.getIdAlmacenOrigen() == null || lineaDTO.getIdAlmacenDestino() == null) {
            throw new Exception("En transferencias ambos almacenes son obligatorios");
        }
        if (lineaDTO.getIdAlmacenOrigen().equals(lineaDTO.getIdAlmacenDestino())) {
            throw new Exception("Los almacenes origen y destino no pueden ser iguales");
        }
        if (lineaDTO.getIdLoteExistente() == null) {
            throw new Exception("El lote es obligatorio en transferencias");
        }

        System.out.println("DEBUG - Buscando lote con ID: " + lineaDTO.getIdLoteExistente());

        // Obtener el lote existente y retornarlo
        return lote_Repository.findById(lineaDTO.getIdLoteExistente())
            .orElseThrow(() -> new Exception("Lote no encontrado con ID: " + lineaDTO.getIdLoteExistente()));
    }

    /**
     * Procesa una línea de ajuste de inventario
     * Solo requiere: idMovimiento, idAlmacenOrigen, idLote y cantidadDelta
     * La base de datos valida que el ajuste no llegue a negativo
     */
    private Lote_Entity procesarAjusteLinea(LineaMovimientoDTO lineaDTO) throws Exception {
        // Validar datos específicos
        if (lineaDTO.getIdAlmacenOrigen() == null) {
            throw new Exception("En ajustes el almacén origen es obligatorio");
        }
        if (lineaDTO.getIdAlmacenDestino() != null) {
            throw new Exception("En ajustes el almacén destino debe ser null");
        }
        if (lineaDTO.getIdLoteExistente() == null) {
            throw new Exception("El lote es obligatorio en ajustes");
        }
        if (lineaDTO.getCantidadDelta() == null || lineaDTO.getCantidadDelta() == 0) {
            throw new Exception("La cantidad delta debe ser diferente de 0 en ajustes");
        }

        System.out.println("DEBUG - Procesando ajuste para lote ID: " + lineaDTO.getIdLoteExistente());
        System.out.println("DEBUG - Almacén origen: " + lineaDTO.getIdAlmacenOrigen());
        System.out.println("DEBUG - Cantidad delta: " + lineaDTO.getCantidadDelta());

        // Obtener el lote existente y retornarlo
        return lote_Repository.findById(lineaDTO.getIdLoteExistente())
            .orElseThrow(() -> new Exception("Lote no encontrado con ID: " + lineaDTO.getIdLoteExistente()));
    }

    /**
     * Crea la línea de movimiento desde el DTO de línea con las validaciones necesarias
     */
    private void crearMovimientoLineaDesdeDTO(LineaMovimientoDTO lineaDTO, Movimiento_Entity movimiento, Lote_Entity lote) throws Exception {
        System.out.println("DEBUG: Iniciando crearMovimientoLineaDesdeDTO");
        System.out.println("DEBUG: Movimiento ID: " + movimiento.getId());
        System.out.println("DEBUG: Lote ID: " + lote.getId());
        System.out.println("DEBUG: CantidadDelta: " + lineaDTO.getCantidadDelta());

        if (lineaDTO.getCantidadDelta() == null || lineaDTO.getCantidadDelta() == 0) {
            throw new Exception("La cantidad delta es obligatoria y debe ser diferente de 0");
        }

        // Hacer flush para asegurar que todas las entidades anteriores tengan IDs
        System.out.println("DEBUG: Haciendo flush...");
        entityManager.flush();
        System.out.println("DEBUG: Flush completado");

        // Crear DTO con solo IDs para evitar problemas de contexto de Hibernate
        System.out.println("DEBUG: Creando CrearMovimientoLineaDTO");
        CrearMovimientoLineaDTO crearLineaDTO = new CrearMovimientoLineaDTO();
        crearLineaDTO.setIdMovimiento(movimiento.getId());
        crearLineaDTO.setIdLote(lote.getId());
        crearLineaDTO.setCantidadDelta(lineaDTO.getCantidadDelta());
        crearLineaDTO.setPrecioVenta(lineaDTO.getPrecioVenta());
        crearLineaDTO.setIdAlmacenOrigen(lineaDTO.getIdAlmacenOrigen());
        crearLineaDTO.setIdAlmacenDestino(lineaDTO.getIdAlmacenDestino());

        System.out.println("DEBUG: LineaDTO - idMovimiento: " + crearLineaDTO.getIdMovimiento());
        System.out.println("DEBUG: LineaDTO - idLote: " + crearLineaDTO.getIdLote());
        System.out.println("DEBUG: LineaDTO - idAlmacenOrigen: " + crearLineaDTO.getIdAlmacenOrigen());
        System.out.println("DEBUG: LineaDTO - idAlmacenDestino: " + crearLineaDTO.getIdAlmacenDestino());

        // Usar el servicio que construye la entidad desde IDs
        System.out.println("DEBUG: Llamando a movimientoLinea_Service.crearDesdeDTO");
        movimientoLinea_Service.crearDesdeDTO(crearLineaDTO);
        System.out.println("DEBUG: MovimientoLinea creado exitosamente");
    }
}
