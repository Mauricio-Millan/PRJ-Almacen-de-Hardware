export interface Almacen {
  id?: number;
  nombre: string;
  direccion?: string;
  telefono?: string;
  estado: boolean; // true = activo, false = inactivo
}
