import { Component, OnInit, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Compra } from '../../core/models/compra';
import { Producto } from '../../core/models/producto';
import { Proveedor } from '../../core/models/proveedor';
import { Almacen } from '../../core/models/almacen';
import { Usuario } from '../../core/models/usuario';
import { MovimientoLinea } from '../../core/models/movimiento-linea';
import { ComprasService } from '../../core/services/compras';
import { ProductosService } from '../../core/services/producto';
import { Proveedores } from '../../core/services/proveedores';
import { Almacenes } from '../../core/services/almacenes';
import { MovimientosService } from '../../core/services/movimientos';
import { MovimientoLineasService } from '../../core/services/movimiento-lineas';
import { UsuariosService } from '../../core/services/usuario';
import { MovimientoGenerarRequest, LineaMovimientoRequest } from '../../core/models/movimiento-generar-request';
import { AuthService } from '../../core/services/auth.service';

interface ItemCompra {
  idProducto: number;
  nombreProducto: string;
  cantidad: number;
  precioUnit: number;
  fechaExpiracion: string;
  subtotal: number;
}

@Component({
  selector: 'app-compras',
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './compras.html',
  styleUrls: ['./compras.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComprasComponent implements OnInit {
  compras = signal<Compra[]>([]);
  productos = signal<Producto[]>([]);
  proveedores = signal<Proveedor[]>([]);
  almacenes = signal<Almacen[]>([]);
  usuarios = signal<Usuario[]>([]);
  
  // Modal principal de nueva compra
  modalVisible = signal(false);
  
  // Modal de búsqueda de productos
  modalBuscarProducto = signal(false);
  productosFiltrados = signal<Producto[]>([]);
  busquedaProducto = signal('');
  
  // Modal de detalle de compra
  modalDetalle = signal(false);
  detalleLineas = signal<MovimientoLinea[]>([]);
  isLoadingDetalle = signal(false);
  compraSeleccionada = signal<Compra | null>(null);
  
  // Datos del formulario de compra
  idProveedor = signal<number | null>(null);
  referencia = signal('');
  comentario = signal('');
  idAlmacenDestino = signal<number | null>(null);
  
  // Items agregados a la compra
  itemsCompra = signal<ItemCompra[]>([]);
  
  // Item temporal al agregar producto
  itemTemporal = signal<{
    producto: Producto | null;
    cantidad: number;
    precioUnit: number;
    fechaExpiracion: string;
  }>({
    producto: null,
    cantidad: 0,
    precioUnit: 0,
    fechaExpiracion: ''
  });
  
  // Computed para el total de la compra
  totalCompra = computed(() => {
    return this.itemsCompra().reduce((sum, item) => sum + item.subtotal, 0);
  });
  
  // Loading states
  isLoading = signal(false);
  isSaving = signal(false);

  // Math para uso en template
  Math = Math;

  constructor(
    private comprasService: ComprasService,
    private productosService: ProductosService,
    private proveedoresService: Proveedores,
    private almacenesService: Almacenes,
    private movimientosService: MovimientosService,
    private movimientoLineasService: MovimientoLineasService,
    private usuariosService: UsuariosService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos() {
    this.isLoading.set(true);
    forkJoin({
      compras: this.comprasService.getCompras(),
      productos: this.productosService.getProductosActivos(),
      proveedores: this.proveedoresService.getProveedores(),
      almacenes: this.almacenesService.getAlmacenes(),
      usuarios: this.usuariosService.getUsuarios()
    }).subscribe({
      next: (data) => {
        this.compras.set(data.compras);
        this.productos.set(data.productos);
        this.proveedores.set(data.proveedores);
        this.almacenes.set(data.almacenes);
        this.usuarios.set(data.usuarios);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar datos:', error);
        this.isLoading.set(false);
        alert('Error al cargar los datos. Por favor, intente nuevamente.');
      }
    });
  }
  
  // Helper para obtener el ID de campos que pueden ser número u objeto
  obtenerIdUsuario(compra: Compra): number | undefined {
    return typeof compra.idUsuario === 'number' ? compra.idUsuario : compra.idUsuario?.id;
  }
  
  obtenerIdProveedor(compra: Compra): number | undefined {
    return typeof compra.idProveedor === 'number' ? compra.idProveedor : compra.idProveedor?.id;
  }
  
  obtenerIdMovimiento(compra: Compra): number | undefined {
    return typeof compra.idMovimiento === 'number' ? compra.idMovimiento : compra.idMovimiento?.id;
  }

  // Helper para obtener el nombre del usuario
  obtenerNombreUsuario(compra: Compra): string {
    const idUsuario = this.obtenerIdUsuario(compra);
    if (!idUsuario) return 'N/A';
    const usuario = this.usuarios().find(u => u.id === idUsuario);
    return usuario ? usuario.nombre : `ID: ${idUsuario}`;
  }

  // Helper para obtener el nombre del proveedor
  obtenerNombreProveedor(compra: Compra): string {
    const idProveedor = this.obtenerIdProveedor(compra);
    if (!idProveedor) return 'N/A';
    const proveedor = this.proveedores().find(p => p.id === idProveedor);
    return proveedor ? proveedor.nombre : `ID: ${idProveedor}`;
  }

  abrirModalNuevo() {
    this.resetearFormulario();
    this.modalVisible.set(true);
  }

  cerrarModal() {
    this.modalVisible.set(false);
    this.resetearFormulario();
  }

  resetearFormulario() {
    this.idProveedor.set(null);
    this.referencia.set('');
    this.comentario.set('');
    this.idAlmacenDestino.set(null);
    this.itemsCompra.set([]);
    this.resetearItemTemporal();
  }

  // --- GESTIÓN DE PRODUCTOS ---
  
  abrirModalBuscarProducto() {
    this.modalBuscarProducto.set(true);
    this.productosFiltrados.set(this.productos());
    this.busquedaProducto.set('');
    this.resetearItemTemporal();
  }

  cerrarModalBuscarProducto() {
    this.modalBuscarProducto.set(false);
    this.resetearItemTemporal();
  }

  resetearItemTemporal() {
    this.itemTemporal.set({
      producto: null,
      cantidad: 0,
      precioUnit: 0,
      fechaExpiracion: ''
    });
  }

  buscarProductos() {
    const termino = this.busquedaProducto().toLowerCase();
    if (termino === '') {
      this.productosFiltrados.set(this.productos());
    } else {
      const filtrados = this.productos().filter(p => 
        p.nombre.toLowerCase().includes(termino) ||
        p.idMarca.nombre.toLowerCase().includes(termino)
      );
      this.productosFiltrados.set(filtrados);
    }
  }

  seleccionarProducto(producto: Producto) {
    this.itemTemporal.update(item => ({
      ...item,
      producto
    }));
  }
  
  actualizarCantidadItem(cantidad: number) {
    this.itemTemporal.update(item => ({
      ...item,
      cantidad
    }));
  }
  
  actualizarPrecioItem(precioUnit: number) {
    this.itemTemporal.update(item => ({
      ...item,
      precioUnit
    }));
  }
  
  actualizarFechaExpiracionItem(fechaExpiracion: string) {
    this.itemTemporal.update(item => ({
      ...item,
      fechaExpiracion
    }));
  }

  agregarItemACompra() {
    const item = this.itemTemporal();
    
    if (!item.producto) {
      alert('Debe seleccionar un producto');
      return;
    }
    
    if (item.cantidad <= 0) {
      alert('La cantidad debe ser mayor a 0');
      return;
    }
    
    if (item.precioUnit <= 0) {
      alert('El precio unitario debe ser mayor a 0');
      return;
    }
    
    if (!item.fechaExpiracion) {
      alert('Debe ingresar la fecha de expiración');
      return;
    }
    
    const nuevoItem: ItemCompra = {
      idProducto: item.producto.id!,
      nombreProducto: item.producto.nombre,
      cantidad: item.cantidad,
      precioUnit: item.precioUnit,
      fechaExpiracion: item.fechaExpiracion,
      subtotal: item.cantidad * item.precioUnit
    };
    
    this.itemsCompra.update(items => [...items, nuevoItem]);
    this.cerrarModalBuscarProducto();
  }

  eliminarItem(index: number) {
    this.itemsCompra.update(items => items.filter((_, i) => i !== index));
  }

  // --- REALIZAR COMPRA ---
  
  confirmarRealizarCompra() {
    if (!this.validarFormulario()) {
      return;
    }
    
    const confirmar = confirm('¿Está seguro de realizar esta compra? Se generarán los registros correspondientes.');
    if (confirmar) {
      this.realizarCompra();
    }
  }

  validarFormulario(): boolean {
    if (!this.idProveedor()) {
      alert('Debe seleccionar un proveedor');
      return false;
    }
    
    if (!this.referencia().trim()) {
      alert('Debe ingresar una referencia');
      return false;
    }
    
    if (!this.idAlmacenDestino()) {
      alert('Debe seleccionar un almacén de destino');
      return false;
    }
    
    if (this.itemsCompra().length === 0) {
      alert('Debe agregar al menos un producto a la compra');
      return false;
    }
    
    return true;
  }

  realizarCompra() {
    this.isSaving.set(true);
    
    // Obtener fecha actual en formato ISO
    const fechaActual = new Date().toISOString();
    
    // Construir las líneas del movimiento desde los items de la compra
    const lineas: LineaMovimientoRequest[] = this.itemsCompra().map(item => ({
      idProducto: item.idProducto,
      cantidadLote: item.cantidad,
      precioUnitario: item.precioUnit,
      fechaExpiracion: item.fechaExpiracion,
      cantidadDelta: item.cantidad,
      idAlmacenDestino: this.idAlmacenDestino()!,
      idAlmacenOrigen: null // null para ABASTECIMIENTO (Compra)
    }));
    
    // Construir la solicitud para el endpoint unificado
    const request: MovimientoGenerarRequest = {
      fecha: fechaActual,
      referencia: this.referencia(),
      comentario: this.comentario(),
      idUsuario: this.authService.getCurrentUserId()!, // Usuario dinámico desde AuthService
      idTipoAccion: 1, // 1 = ABASTECIMIENTO (Compra)
      idProveedor: this.idProveedor()!,
      lineas: lineas
    };
    
    console.log('Enviando solicitud de compra:', JSON.stringify(request, null, 2));
    
    // Llamada única al endpoint unificado
    this.movimientosService.generarMovimiento(request).subscribe({
      next: (response) => {
        console.log('Respuesta del servidor:', response);
        this.isSaving.set(false);
        
        if (response.success) {
          alert('¡Compra realizada exitosamente!');
          this.cerrarModal();
          this.cargarDatos();
        } else {
          alert(`Error al realizar la compra: ${response.message}`);
        }
      },
      error: (error) => {
        console.error('Error al realizar la compra:', error);
        this.isSaving.set(false);
        const mensajeError = error.error?.message || error.message || 'Error desconocido';
        alert(`Error al realizar la compra: ${mensajeError}`);
      }
    });
  }
  
  // --- MODAL ELIMINACIÓN ---
  showDeleteModalCompra = false;
  compraAEliminar: Compra | null = null;

  toggleDeleteModalCompra() {
    this.showDeleteModalCompra = !this.showDeleteModalCompra;
  }
  
  confirmarEliminarCompra(compra: Compra) {
    this.compraAEliminar = compra;
    this.showDeleteModalCompra = true;
  }
  
  deleteCompraConfirmed() {
    if (this.compraAEliminar?.id) {
      this.comprasService.deleteCompra(this.compraAEliminar.id).subscribe({
        next: () => {
          alert('Compra eliminada exitosamente');
          this.showDeleteModalCompra = false;
          this.compraAEliminar = null;
          this.cargarDatos();
        },
        error: (error) => {
          console.error('Error al eliminar compra:', error);
          alert('Error al eliminar la compra');
        }
      });
    }
  }

  // --- VER DETALLE DE COMPRA ---
  
  abrirModalDetalle(compra: Compra) {
    const idMovimiento = this.obtenerIdMovimiento(compra);
    if (!idMovimiento) {
      alert('No se puede obtener el ID del movimiento');
      return;
    }

    this.compraSeleccionada.set(compra);
    this.modalDetalle.set(true);
    this.isLoadingDetalle.set(true);

    this.movimientoLineasService.getMovimientoLineasByMovimiento(idMovimiento).subscribe({
      next: (lineas) => {
        this.detalleLineas.set(lineas);
        this.isLoadingDetalle.set(false);
      },
      error: (error) => {
        console.error('Error al cargar detalle:', error);
        this.isLoadingDetalle.set(false);
        alert('Error al cargar el detalle de la compra');
      }
    });
  }

  cerrarModalDetalle() {
    this.modalDetalle.set(false);
    this.detalleLineas.set([]);
    this.compraSeleccionada.set(null);
  }

  calcularTotalDetalle(): number {
    return this.detalleLineas().reduce((sum, linea) => {
      const cantidad = Math.abs(linea.cantidadDelta);
      const precio = linea.idLote.precioUnit || 0;
      return sum + (cantidad * precio);
    }, 0);
  }

  async exportarDetallePDF(): Promise<void> {
    if (!this.compraSeleccionada()) return;

    try {
      const jspdfModule = await import('jspdf');
      const { jsPDF } = jspdfModule as any;
      const pdf = new jsPDF();
      
      const compra = this.compraSeleccionada()!;
      const lineas = this.detalleLineas();
      
      // Título
      pdf.setFontSize(18);
      pdf.text('Detalle de Compra', 105, 15, { align: 'center' });
      
      // Información general
      pdf.setFontSize(11);
      let y = 30;
      
      pdf.text(`Fecha: ${compra.fecha ? new Date(compra.fecha).toLocaleString('es-PE') : 'N/A'}`, 20, y);
      y += 7;
      pdf.text(`Proveedor: ${this.obtenerNombreProveedor(compra)}`, 20, y);
      y += 7;
      pdf.text(`Usuario: ${this.obtenerNombreUsuario(compra)}`, 20, y);
      y += 7;
      pdf.text(`Estado: ${compra.estado ? 'Activa' : 'Inactiva'}`, 20, y);
      y += 15;
      
      // Encabezados de tabla
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'bold');
      pdf.text('Producto', 20, y);
      pdf.text('Marca', 70, y);
      pdf.text('Lote', 110, y);
      pdf.text('Cant.', 140, y, { align: 'right' });
      pdf.text('P. Unit.', 165, y, { align: 'right' });
      pdf.text('Subtotal', 190, y, { align: 'right' });
      y += 2;
      
      // Línea separadora
      pdf.line(20, y, 190, y);
      y += 5;
      
      // Detalle de líneas
      pdf.setFont(undefined, 'normal');
      lineas.forEach(linea => {
        if (y > 270) {
          pdf.addPage();
          y = 20;
        }
        
        const producto = linea.idLote.idProducto.nombre || 'N/A';
        const marca = linea.idLote.idProducto.idMarca.nombre || 'N/A';
        const lote = linea.idLote.codigoLote || linea.idLote.id.toString();
        const cantidad = Math.abs(linea.cantidadDelta).toString();
        const precioUnit = `S/ ${(linea.idLote.precioUnit || 0).toFixed(2)}`;
        const subtotal = `S/ ${(Math.abs(linea.cantidadDelta) * (linea.idLote.precioUnit || 0)).toFixed(2)}`;
        
        pdf.text(producto.substring(0, 25), 20, y);
        pdf.text(marca.substring(0, 20), 70, y);
        pdf.text(lote.substring(0, 15), 110, y);
        pdf.text(cantidad, 140, y, { align: 'right' });
        pdf.text(precioUnit, 165, y, { align: 'right' });
        pdf.text(subtotal, 190, y, { align: 'right' });
        y += 7;
      });
      
      // Total
      y += 3;
      pdf.line(20, y, 190, y);
      y += 7;
      pdf.setFont(undefined, 'bold');
      pdf.setFontSize(12);
      pdf.text('TOTAL:', 140, y, { align: 'right' });
      pdf.text(`S/ ${this.calcularTotalDetalle().toFixed(2)}`, 190, y, { align: 'right' });
      
      // Guardar PDF
      const fecha = compra.fecha ? new Date(compra.fecha).toISOString().split('T')[0] : 'sin-fecha';
      pdf.save(`compra-detalle-${compra.id}-${fecha}.pdf`);
      
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      alert('Error al generar el PDF. Por favor, intente nuevamente.');
    }
  }
}
