package org.example.prj_rest_control_almacen_hardware.Controller;

import org.example.prj_rest_control_almacen_hardware.DTOs.GenerarMovimientoDTO;
import org.example.prj_rest_control_almacen_hardware.Model.Movimiento_Entity;
import org.example.prj_rest_control_almacen_hardware.Service.Movimiento_Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/movimientos")
public class Movimiento_Controller {
    @Autowired
    private Movimiento_Service movimiento_Service;

    @GetMapping
    public List<Movimiento_Entity> findAll() {
        return movimiento_Service.findAll();
    }

    @GetMapping("/{id}")
    public Optional<Movimiento_Entity> findById(@PathVariable Long id) {
        return movimiento_Service.findById(id);
    }

    @PostMapping
    public Movimiento_Entity save(@RequestBody Movimiento_Entity movimiento) {
        movimiento.setId(null);
        return movimiento_Service.save(movimiento);
    }

    @PutMapping("/{id}")
    public Optional<Movimiento_Entity> update(@PathVariable Long id, @RequestBody Movimiento_Entity movimiento) {
        return movimiento_Service.update(id, movimiento);
    }

    @DeleteMapping("/{id}")
    public String deleteById(@PathVariable Long id) {
        return movimiento_Service.deleteById(id);
    }

    /**
     * Endpoint para generar un movimiento completo (Abastecimiento/Venta/Transferencia)
     * Este método maneja toda la transacción de forma atómica:
     * - Abastecimiento: Crea Movimiento + Compra + Lote + MovimientoLinea
     * - Venta: Crea Movimiento + Venta + MovimientoLinea
     * - Transferencia: Crea Movimiento + MovimientoLinea
     */
    @PostMapping("/generar")
    public ResponseEntity<?> generarMovimiento(@RequestBody GenerarMovimientoDTO dto) {
        try {
            Movimiento_Entity movimiento = movimiento_Service.generarMovimiento(dto);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Movimiento generado exitosamente");
            response.put("data", movimiento);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            errorResponse.put("error", e.getClass().getSimpleName());

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }
}
