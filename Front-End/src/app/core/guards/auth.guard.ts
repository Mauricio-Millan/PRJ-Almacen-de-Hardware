import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard para proteger rutas que requieren autenticación
 * Si el usuario no está autenticado, redirige al login
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Guardar la URL a la que intentaba acceder para redirigir después del login
  const returnUrl = state.url;
  console.log('Usuario no autenticado, redirigiendo al login. URL destino:', returnUrl);
  
  router.navigate(['/login'], { queryParams: { returnUrl } });
  return false;
};

/**
 * Guard para evitar que usuarios autenticados accedan al login
 * Si el usuario ya está autenticado, redirige al dashboard
 */
export const loginGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }

  console.log('Usuario ya autenticado, redirigiendo al dashboard');
  router.navigate(['/dashboard']);
  return false;
};
