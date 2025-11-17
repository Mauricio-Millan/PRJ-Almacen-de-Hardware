export interface InformacionUsuario {
  idUsuario: number;
  nombreUsuario: string;
  dni: string;
  rol: string;
}

export interface AccionLineaTiempo {
  idMovimiento: number;
  fechaHora: string;
  idTipoAccion: number;
  tipoAccion: string;
  referencia: string;
  comentario: string;
  idMovimientoLinea: number;
  cantidad: number;
  precioVenta: number | null;
  idLote: number;
  idProducto: number;
  nombreProducto: string;
  marca: string;
  precioUnitarioLote: number;
  idAlmacenOrigen: number | null;
  almacenOrigen: string | null;
  idAlmacenDestino: number | null;
  almacenDestino: string | null;
  descripcionAccion: string;
  fechaRegistro: string;
  tipoFlujo: string;
}

export interface ResumenAcciones {
  totalMovimientos: number;
  totalAbastecimientos: number;
  totalTraslados: number;
  totalAjustes: number;
  totalVentas: number;
  totalUnidadesAbastecidas: number;
  totalUnidadesTrasladadas: number;
  totalUnidadesVendidas: number;
  totalIngresosVentas: number;
  primeraAccion: string;
  ultimaAccion: string;
}

export interface TopProducto {
  idProducto: number;
  nombreProducto: string;
  marca: string;
  cantidadMovimientos: number;
  totalUnidadesManejadas: number;
}

export interface AlmacenUtilizado {
  idAlmacen: number;
  nombreAlmacen: string;
  cantidadOperaciones: number;
  operacionesComoOrigen: number;
  operacionesComoDestino: number;
}

export interface UsuarioAcciones {
  informacionUsuario: InformacionUsuario;
  lineaTiempo: AccionLineaTiempo[];
  resumen: ResumenAcciones;
  topProductos: TopProducto[];
  almacenesUtilizados: AlmacenUtilizado[];
}
