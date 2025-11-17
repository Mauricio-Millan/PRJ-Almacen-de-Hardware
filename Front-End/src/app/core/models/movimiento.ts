export interface Movimiento {
  id?: number;
  fecha?: string;
  referencia: string;
  comentario: string;
  createdAt?: string;
  estado: boolean;
  idUsuario: {
    id: number;
  };
  idTipoAccion: {
    id: number;
  };
}
