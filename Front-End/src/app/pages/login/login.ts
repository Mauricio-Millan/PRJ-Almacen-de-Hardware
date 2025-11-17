import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuariosService } from '../../core/services/usuario';
import { AuthService } from '../../core/services/auth.service';
import { LoginRequest } from '../../core/models/login';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Login {
  // Signals para el formulario
  dni = signal('');
  clave = signal('');
  
  // Signals para el estado
  isLoading = signal(false);
  errorMessage = signal('');
  showPassword = signal(false);

  constructor(
    private usuariosService: UsuariosService,
    private authService: AuthService,
    private router: Router
  ) {
    // Si ya está autenticado, redirigir al dashboard
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  /**
   * Maneja el envío del formulario de login
   */
  onSubmit(): void {
    // Validaciones
    if (!this.dni().trim()) {
      this.errorMessage.set('El DNI es requerido');
      return;
    }

    if (!this.clave().trim()) {
      this.errorMessage.set('La clave es requerida');
      return;
    }

    if (this.dni().length < 8) {
      this.errorMessage.set('El DNI debe tener al menos 8 caracteres');
      return;
    }

    // Limpiar mensaje de error y establecer loading
    this.errorMessage.set('');
    this.isLoading.set(true);

    // Preparar la solicitud
    const loginRequest: LoginRequest = {
      dni: this.dni().trim(),
      clave: this.clave().trim()
    };

    console.log('Intentando login con:', { dni: loginRequest.dni });

    // Realizar la petición de login
    this.usuariosService.login(loginRequest).subscribe({
      next: (response) => {
        console.log('Respuesta del servidor:', response);
        this.isLoading.set(false);

        if (response.success && response.usuario) {
          // Guardar el usuario en el AuthService
          this.authService.setCurrentUser(response.usuario);
          
          // Mostrar mensaje de bienvenida
          console.log('Login exitoso. Bienvenido:', response.usuario.nombre);
          
          // Redirigir al dashboard
          this.router.navigate(['/dashboard']);
        } else {
          // Login fallido
          this.errorMessage.set(response.message || 'Credenciales incorrectas');
        }
      },
      error: (error) => {
        console.error('Error en login:', error);
        this.isLoading.set(false);
        
        // Manejar diferentes tipos de error
        if (error.status === 401) {
          this.errorMessage.set('DNI o clave incorrectos');
        } else if (error.status === 0) {
          this.errorMessage.set('No se pudo conectar con el servidor');
        } else {
          const mensaje = error.error?.message || 'Error al iniciar sesión';
          this.errorMessage.set(mensaje);
        }
      }
    });
  }

  /**
   * Alterna la visibilidad de la contraseña
   */
  togglePasswordVisibility(): void {
    this.showPassword.update(value => !value);
  }

  /**
   * Limpia el mensaje de error
   */
  clearError(): void {
    this.errorMessage.set('');
  }
}
