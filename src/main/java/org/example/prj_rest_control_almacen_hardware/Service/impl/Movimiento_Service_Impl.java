package org.example.prj_rest_control_almacen_hardware.Service.impl;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.example.prj_rest_control_almacen_hardware.DTOs.CrearMovimientoLineaDTO;
import org.example.prj_rest_control_almacen_hardware.DTOs.GenerarMovimientoDTO;
import org.example.prj_rest_control_almacen_hardware.Model.*;
import org.example.prj_rest_control_almacen_hardware.Repository.*;
import org.example.prj_rest_control_almacen_hardware.Service.Movimiento_Service;
import org.example.prj_rest_control_almacen_hardware.Service.MovimientoLinea_Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
            // DEBUG - Imprimir todos los campos recibidos
            System.out.println("=== DEBUG: Datos recibidos ===");
            System.out.println("idUsuario: " + dto.getIdUsuario());
            System.out.println("idTipoAccion: " + dto.getIdTipoAccion());
            System.out.println("idLoteExistente: " + dto.getIdLoteExistente());
            System.out.println("idAlmacenOrigen: " + dto.getIdAlmacenOrigen());
            System.out.println("idAlmacenDestino: " + dto.getIdAlmacenDestino());
            System.out.println("cantidadDelta: " + dto.getCantidadDelta());
            System.out.println("===========================");

            // 1. Validar datos básicos requeridos
            if (dto.getIdUsuario() == null || dto.getIdTipoAccion() == null) {
                throw new Exception("Usuario y Tipo de Acción son obligatorios");
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

            // 2. Crear el Movimiento
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

            // 3. Procesar según el tipo de movimiento
            Long idTipo = dto.getIdTipoAccion();
            Lote_Entity lote;

            if (idTipo == 1) {
                // ABASTECIMIENTO (Compra)
                if (dto.getIdAlmacenOrigen() != null) {
                    throw new Exception("En abastecimientos el almacén origen debe ser null");
                }
                if (dto.getIdAlmacenDestino() == null) {
                    throw new Exception("En abastecimientos el almacén destino es obligatorio");
                }

                lote = procesarAbastecimiento(dto, movimiento, usuario);

            } else if (idTipo == 4) {
                // VENTA
                if (dto.getIdAlmacenDestino() != null) {
                    throw new Exception("En ventas el almacén destino debe ser null");
                }
                if (dto.getIdAlmacenOrigen() == null) {
                    throw new Exception("En ventas el almacén origen es obligatorio");
                }
                if (dto.getIdLoteExistente() == null) {
                    throw new Exception("En ventas el lote existente es obligatorio");
                }

                lote = procesarVenta(dto, movimiento, usuario);

            } else if (idTipo == 2) {
                // TRANSFERENCIA
                if (dto.getIdAlmacenOrigen() == null || dto.getIdAlmacenDestino() == null) {
                    throw new Exception("En transferencias ambos almacenes son obligatorios");
                }
                if (dto.getIdAlmacenOrigen().equals(dto.getIdAlmacenDestino())) {
                    throw new Exception("Los almacenes origen y destino no pueden ser iguales");
                }
                if (dto.getIdLoteExistente() == null) {
                    throw new Exception("En transferencias el lote existente es obligatorio. Verifica el campo 'idLoteExistente' en el JSON.");
                }

                lote = procesarTransferencia(dto);

            } else {
                throw new Exception("Tipo de acción no válido");
            }

            // 4. Crear la línea de movimiento
            crearMovimientoLinea(dto, movimiento, lote);

            return movimiento;

        } catch (Exception e) {
            // El rollback se maneja automáticamente con @Transactional
            throw new Exception("Error al generar movimiento: " + e.getMessage(), e);
        }
    }

    /**
     * Procesa un abastecimiento (compra) creando la compra y el lote
     */
    private Lote_Entity procesarAbastecimiento(GenerarMovimientoDTO dto, Movimiento_Entity movimiento, Usuario_Entity usuario) throws Exception {
        // Validar datos específicos
        if (dto.getIdProveedor() == null) {
            throw new Exception("El proveedor es obligatorio en abastecimientos");
        }
        if (dto.getIdProducto() == null) {
            throw new Exception("El producto es obligatorio en abastecimientos");
        }
        if (dto.getCantidadLote() == null || dto.getCantidadLote() <= 0) {
            throw new Exception("La cantidad del lote debe ser mayor a 0");
        }

        // Obtener proveedor
        Proveedor_Entity proveedor = proveedor_Repository.findById(dto.getIdProveedor())
            .orElseThrow(() -> new Exception("Proveedor no encontrado"));

        // Crear la compra
        Compra_Entity compra = new Compra_Entity();
        compra.setFecha(movimiento.getFecha());
        compra.setEstado(true);
        compra.setIdUsuario(usuario);
        compra.setIdMovimiento(movimiento);
        compra.setIdProveedor(proveedor);
        compra = compra_Repository.save(compra);

        // Crear el lote
        Producto_Entity producto = producto_Repository.findById(dto.getIdProducto().intValue())
            .orElseThrow(() -> new Exception("Producto no encontrado"));

        Lote_Entity lote = new Lote_Entity();
        lote.setIdCompra(compra);
        lote.setCantidad(dto.getCantidadLote());
        lote.setPrecioUnit(dto.getPrecioUnitario());
        lote.setFechaExpiracion(dto.getFechaExpiracion());
        lote.setEstado(true);
        lote.setIdProducto(producto);
        lote = lote_Repository.save(lote);

        return lote;
    }

    /**
     * Procesa una venta
     */
    private Lote_Entity procesarVenta(GenerarMovimientoDTO dto, Movimiento_Entity movimiento, Usuario_Entity usuario) throws Exception {
        // Validar datos específicos
        if (dto.getIdCliente() == null) {
            throw new Exception("El cliente es obligatorio en ventas");
        }
        if (dto.getIdLoteExistente() == null) {
            throw new Exception("El lote es obligatorio en ventas");
        }
        if (dto.getPrecioVenta() == null) {
            throw new Exception("El precio de venta es obligatorio");
        }

        // Obtener cliente
        Cliente_Entity cliente = cliente_Repository.findById(dto.getIdCliente())
            .orElseThrow(() -> new Exception("Cliente no encontrado"));

        // Crear la venta
        Venta_Entity venta = new Venta_Entity();
        venta.setIdUsuario(usuario);
        venta.setIdMovimiento(movimiento);
        venta.setIdCliente(cliente);
        venta.setFecha(LocalDate.now());
        venta.setEstado(true);
        venta_Repository.save(venta);

        // Obtener el lote existente y retornarlo
        return lote_Repository.findById(dto.getIdLoteExistente())
            .orElseThrow(() -> new Exception("Lote no encontrado"));
    }

    /**
     * Procesa una transferencia
     */
    private Lote_Entity procesarTransferencia(GenerarMovimientoDTO dto) throws Exception {
        // Validar datos específicos con mensajes detallados
        if (dto.getIdLoteExistente() == null) {
            throw new Exception("El lote es obligatorio en transferencias. Campo 'idLoteExistente' no puede ser null.");
        }

        // Log para debug
        System.out.println("DEBUG - Buscando lote con ID: " + dto.getIdLoteExistente());

        // Obtener el lote existente y retornarlo
        return lote_Repository.findById(dto.getIdLoteExistente())
            .orElseThrow(() -> new Exception("Lote no encontrado con ID: " + dto.getIdLoteExistente()));
    }

    /**
     * Crea la línea de movimiento con las validaciones necesarias
     */
    private void crearMovimientoLinea(GenerarMovimientoDTO dto, Movimiento_Entity movimiento, Lote_Entity lote) throws Exception {
        System.out.println("DEBUG: Iniciando crearMovimientoLinea");
        System.out.println("DEBUG: Movimiento ID: " + movimiento.getId());
        System.out.println("DEBUG: Lote ID: " + lote.getId());
        System.out.println("DEBUG: CantidadDelta: " + dto.getCantidadDelta());

        if (dto.getCantidadDelta() == null || dto.getCantidadDelta() == 0) {
            throw new Exception("La cantidad delta es obligatoria y debe ser diferente de 0");
        }

        // Hacer flush para asegurar que todas las entidades anteriores tengan IDs
        System.out.println("DEBUG: Haciendo flush...");
        entityManager.flush();
        System.out.println("DEBUG: Flush completado");

        // Crear DTO con solo IDs para evitar problemas de contexto de Hibernate
        System.out.println("DEBUG: Creando CrearMovimientoLineaDTO");
        CrearMovimientoLineaDTO lineaDTO = new CrearMovimientoLineaDTO();
        lineaDTO.setIdMovimiento(movimiento.getId());
        lineaDTO.setIdLote(lote.getId());
        lineaDTO.setCantidadDelta(dto.getCantidadDelta());
        lineaDTO.setPrecioVenta(dto.getPrecioVenta());
        lineaDTO.setIdAlmacenOrigen(dto.getIdAlmacenOrigen());
        lineaDTO.setIdAlmacenDestino(dto.getIdAlmacenDestino());

        System.out.println("DEBUG: LineaDTO - idMovimiento: " + lineaDTO.getIdMovimiento());
        System.out.println("DEBUG: LineaDTO - idLote: " + lineaDTO.getIdLote());
        System.out.println("DEBUG: LineaDTO - idAlmacenOrigen: " + lineaDTO.getIdAlmacenOrigen());
        System.out.println("DEBUG: LineaDTO - idAlmacenDestino: " + lineaDTO.getIdAlmacenDestino());

        // Usar el servicio que construye la entidad desde IDs
        System.out.println("DEBUG: Llamando a movimientoLinea_Service.crearDesdeDTO");
        movimientoLinea_Service.crearDesdeDTO(lineaDTO);
        System.out.println("DEBUG: MovimientoLinea creado exitosamente");
    }
}
