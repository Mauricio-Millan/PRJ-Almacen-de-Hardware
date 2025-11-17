import { Marca } from './marca';

export interface Producto {
  id?: number;
  nombre: string;
  idMarca: Marca;
  estado: boolean;
}
