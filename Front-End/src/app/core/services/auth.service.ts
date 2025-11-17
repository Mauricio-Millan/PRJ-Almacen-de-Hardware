import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Usuario } from '../models/usuario';

/**
 * Servicio de autenticación
 * Maneja el estado de sesión del usuario y localStorage
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly STORAGE_KEY = 'currentUser';
  
  // Signal para el usuario actual
  private currentUserSignal = signal<Usuario | null>(this.getUserFromStorage());
  
  // Computed para verificar si está autenticado
  isAuthenticated = computed(() => this.currentUserSignal() !== null);
  
  // Computed para obtener el usuario actual
  currentUser = computed(() => this.currentUserSignal());

  constructor(private router: Router) {}

  /**
   * Guarda el usuario en localStorage y actualiza el signal
   */
  setCurrentUser(usuario: Usuario): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(usuario));
    this.currentUserSignal.set(usuario);
  }

  /**
   * Obtiene el usuario del localStorage
   */
  private getUserFromStorage(): Usuario | null {
    const userData = localStorage.getItem(this.STORAGE_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Obtiene el ID del usuario actual
   */
  getCurrentUserId(): number | null {
    return this.currentUser()?.id || null;
  }

  /**
   * Obtiene el nombre del usuario actual
   */
  getCurrentUserName(): string {
    return this.currentUser()?.nombre || 'Usuario';
  }

  /**
   * Obtiene el rol del usuario actual
   */
  getCurrentUserRole(): string {
    return this.currentUser()?.idRol?.nombre || 'Sin rol';
  }

  /**
   * Verifica si el usuario tiene un rol específico
   */
  hasRole(roleName: string): boolean {
    return this.currentUser()?.idRol?.nombre === roleName;
  }

  /**
   * Cierra la sesión del usuario
   */
  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }

  /**
   * Verifica si hay una sesión activa
   */
  checkAuthentication(): boolean {
    return this.isAuthenticated();
  }
}
