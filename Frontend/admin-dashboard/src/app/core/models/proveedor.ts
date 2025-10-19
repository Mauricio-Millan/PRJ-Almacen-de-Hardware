export interface Proveedor {
  id?: number;
  nombre: string;
  ruc: string;
  telefono?: string;
  estado: boolean; // true = activo, false = inactivo
}
