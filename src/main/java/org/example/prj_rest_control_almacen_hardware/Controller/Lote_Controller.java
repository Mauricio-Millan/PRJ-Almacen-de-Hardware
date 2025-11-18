package org.example.prj_rest_control_almacen_hardware.Controller;

import org.example.prj_rest_control_almacen_hardware.DTOs.HistorialLoteDTO;
import org.example.prj_rest_control_almacen_hardware.Model.Lote_Entity;
import org.example.prj_rest_control_almacen_hardware.Service.Lote_Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/lotes")
public class Lote_Controller {
    @Autowired
    private Lote_Service lote_Service;

    @GetMapping
    public List<Lote_Entity> findAll() {
        return lote_Service.findAll();
    }

    @GetMapping("/{id}")
    public Optional<Lote_Entity> findById(@PathVariable Long id) {
        return lote_Service.findById(id);
    }

    @GetMapping("/compra/{idCompra}")
    public List<Lote_Entity> findByIdCompra(@PathVariable Long idCompra) {
        return lote_Service.findByIdCompraId(idCompra);
    }

    @GetMapping("/producto/{idProducto}")
    public List<Lote_Entity> findByIdProducto(@PathVariable Long idProducto) {
        return lote_Service.findByIdProductoId(idProducto);
    }

    @GetMapping("/{id}/historial")
    public ResponseEntity<?> obtenerHistorialMovimientos(@PathVariable Long id) {
        try {
            HistorialLoteDTO historial = lote_Service.obtenerHistorialMovimientos(id);

            if (historial.getInfoLote() == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "El lote con ID " + id + " no existe");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", historial);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error al obtener el historial: " + e.getMessage());
            response.put("error", "Exception");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping
    public Lote_Entity save(@RequestBody Lote_Entity lote) {
        lote.setId(null);
        return lote_Service.save(lote);
    }

    @PutMapping("/{id}")
    public Optional<Lote_Entity> update(@PathVariable Long id, @RequestBody Lote_Entity lote) {
        return lote_Service.update(id, lote);
    }

    @DeleteMapping("/{id}")
    public String deleteById(@PathVariable Long id) {
        return lote_Service.deleteById(id);
    }
}

