import { Usuario } from './usuario';

/**
 * Interface para la solicitud de login
 */
export interface LoginRequest {
  dni: string;
  clave: string;
}

/**
 * Interface para la respuesta del login
 */
export interface LoginResponse {
  success: boolean;
  message: string;
  usuario: Usuario;
  tipoError: string | null;
}
