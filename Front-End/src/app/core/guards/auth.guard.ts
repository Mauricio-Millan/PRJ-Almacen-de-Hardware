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

/**
 * Guard para restringir rutas según ID de rol
 */
export const roleRestrictionGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const disallowedRoles = route.data?.['disallowedRoles'] as number[] | undefined;

  if (!disallowedRoles?.length) {
    return true;
  }

  const currentRoleId = authService.getCurrentUserRoleId();

  if (currentRoleId !== null && disallowedRoles.includes(currentRoleId)) {
    console.warn('Acceso bloqueado por restricciones de rol. Ruta:', state.url);
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};
