package org.example.prj_rest_control_almacen_hardware.DTOs;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.prj_rest_control_almacen_hardware.Model.Usuario_Entity;

/**
 * DTO para la respuesta del login
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponseDTO {
    private boolean success;
    private String message;
    private Usuario_Entity usuario;
    private String tipoError; // "DNI_INCORRECTO", "CLAVE_INCORRECTA", null si no hay error

    // Constructor para respuesta exitosa
    public LoginResponseDTO(Usuario_Entity usuario) {
        this.success = true;
        this.message = "Login exitoso";
        this.usuario = usuario;
        this.tipoError = null;
    }

    // Constructor para respuesta de error
    public LoginResponseDTO(String message, String tipoError) {
        this.success = false;
        this.message = message;
        this.usuario = null;
        this.tipoError = tipoError;
    }
}

