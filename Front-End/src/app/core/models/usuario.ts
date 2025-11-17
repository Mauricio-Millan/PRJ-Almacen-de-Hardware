import { Rol } from './rol';

export interface Usuario {
  id?: number;
  nombre: string;
  clave: string;
  dni: string;
  fechaNacimiento: string; // ISO string
  idRol: Rol;
  estado: boolean;
}
