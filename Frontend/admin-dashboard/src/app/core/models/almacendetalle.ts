export interface ProductoDetalle {
  idContenidoAlmacen: number;
  idProducto: number;
  nombreProducto: string;
  marca: string;
  numeroLote: number;
  precioUnitario: number;
  fechaExpiracion: string;
  cantidadLote: number;
  stockActual: number;
  estadoStock: string;
}

export interface ResumenAlmacen {
  totalProductosDistintos: number;
  totalLotes: number;
  totalUnidades: number;
  valorTotalInventario: number;
  lotesSinStock: number;
  lotesConStock: number;
}

export interface InformacionAlmacen {
  idAlmacen: number;
  nombreAlmacen: string;
  direccion: string;
  telefono: string;
}

export interface AlmacenDetalle {
  informacion: InformacionAlmacen;
  productos: ProductoDetalle[];
  resumen: ResumenAlmacen;
}
