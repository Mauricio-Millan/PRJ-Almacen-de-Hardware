import { Component, OnInit, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Compra } from '../../core/models/compra';
import { Producto } from '../../core/models/producto';
import { Proveedor } from '../../core/models/proveedor';
import { Almacen } from '../../core/models/almacen';
import { Usuario } from '../../core/models/usuario';
import { ComprasService } from '../../core/services/compras';
import { ProductosService } from '../../core/services/producto';
import { Proveedores } from '../../core/services/proveedores';
import { Almacenes } from '../../core/services/almacenes';
import { MovimientosService } from '../../core/services/movimientos';
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

  constructor(
    private comprasService: ComprasService,
    private productosService: ProductosService,
    private proveedoresService: Proveedores,
    private almacenesService: Almacenes,
    private movimientosService: MovimientosService,
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
}
