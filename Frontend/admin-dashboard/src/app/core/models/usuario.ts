export interface Rol {
  id: number;
  nombre: string;
  estado: boolean;
}

export interface Usuario {
  id?: number;
  nombre: string;
  clave: string;
  dni: string;
  fechaNacimiento: string; // ISO string (YYYY-MM-DD)
  idRol: Rol;
  estado: boolean;
}
