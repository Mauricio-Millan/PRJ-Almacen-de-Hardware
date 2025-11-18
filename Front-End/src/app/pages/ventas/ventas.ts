import { Component, OnInit, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Venta } from '../../core/models/venta';
import { Cliente } from '../../core/models/cliente';
import { Almacen } from '../../core/models/almacen';
import { ProductoDetalle } from '../../core/models/almacendetalle';
import { Usuario } from '../../core/models/usuario';
import { MovimientoLinea } from '../../core/models/movimiento-linea';
import { VentasService } from '../../core/services/ventas';
import { ClientesService } from '../../core/services/cliente';
import { Almacenes } from '../../core/services/almacenes';
import { AlmacendetalleService } from '../../core/services/almacendetalleservice';
import { MovimientosService } from '../../core/services/movimientos';
import { MovimientoLineasService } from '../../core/services/movimiento-lineas';
import { UsuariosService } from '../../core/services/usuario';
import { AuthService } from '../../core/services/auth.service';
import { MovimientoGenerarRequest, LineaMovimientoRequest } from '../../core/models/movimiento-generar-request';

interface ItemVenta {
  idLote: number;
  nombreProducto: string;
  marca: string;
  stockDisponible: number;
  precioVenta: number;
  cantidad: number;
  subtotal: number;
}

@Component({
  selector: 'app-ventas',
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './ventas.html',
  styleUrls: ['./ventas.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VentasComponent implements OnInit {
  ventas = signal<Venta[]>([]);
  clientes = signal<Cliente[]>([]);
  almacenes = signal<Almacen[]>([]);
  usuarios = signal<Usuario[]>([]);
  productosDisponibles = signal<ProductoDetalle[]>([]);
  
  // Modal principal de nueva venta
  modalVisible = signal(false);
  
  // Modal de selección de productos/lotes
  modalSeleccionarLote = signal(false);
  productosFiltrados = signal<ProductoDetalle[]>([]);
  busquedaProducto = signal('');
  
  // Modal de detalle de venta
  modalDetalle = signal(false);
  detalleLineas = signal<MovimientoLinea[]>([]);
  isLoadingDetalle = signal(false);
  ventaSeleccionada = signal<Venta | null>(null);
  
  // Datos del formulario de venta
  idCliente = signal<number | null>(null);
  referencia = signal('');
  comentario = signal('');
  idAlmacenOrigen = signal<number | null>(null);
  
  // Items agregados a la venta
  itemsVenta = signal<ItemVenta[]>([]);
  
  // Item temporal al agregar producto
  itemTemporal = signal<{
    lote: ProductoDetalle | null;
    cantidad: number;
    precioVenta: number;
  }>({
    lote: null,
    cantidad: 0,
    precioVenta: 0
  });
  
  // Computed para el total de la venta
  totalVenta = computed(() => {
    return this.itemsVenta().reduce((sum, item) => sum + item.subtotal, 0);
  });
  
  // Loading states
  isLoading = signal(false);
  isSaving = signal(false);
  isLoadingLotes = signal(false);

  // Math para uso en template
  Math = Math;

  constructor(
    private ventasService: VentasService,
    private clientesService: ClientesService,
    private almacenesService: Almacenes,
    private almacenDetalleService: AlmacendetalleService,
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
      ventas: this.ventasService.getVentas(),
      clientes: this.clientesService.getClientes(),
      almacenes: this.almacenesService.getAlmacenes(),
      usuarios: this.usuariosService.getUsuarios()
    }).subscribe({
      next: (data) => {
        this.ventas.set(data.ventas);
        this.clientes.set(data.clientes);
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

  abrirModalNuevo() {
    this.resetearFormulario();
    this.modalVisible.set(true);
  }

  cerrarModal() {
    this.modalVisible.set(false);
    this.resetearFormulario();
  }

  resetearFormulario() {
    this.idCliente.set(null);
    this.referencia.set('');
    this.comentario.set('');
    this.idAlmacenOrigen.set(null);
    this.itemsVenta.set([]);
    this.productosDisponibles.set([]);
    this.resetearItemTemporal();
  }

  // --- GESTIÓN DE LOTES/PRODUCTOS ---
  
  onAlmacenChange() {
    const idAlmacen = this.idAlmacenOrigen();
    if (idAlmacen) {
      this.cargarLotesDelAlmacen(idAlmacen);
    } else {
      this.productosDisponibles.set([]);
    }
  }

  cargarLotesDelAlmacen(idAlmacen: number) {
    this.isLoadingLotes.set(true);
    this.almacenDetalleService.getAlmacenDetalle(idAlmacen).subscribe({
      next: (detalle) => {
        // Filtrar solo productos con stock disponible
        const lotesConStock = detalle.productos.filter(p => p.stockActual > 0);
        this.productosDisponibles.set(lotesConStock);
        this.isLoadingLotes.set(false);
      },
      error: (error) => {
        console.error('Error al cargar lotes del almacén:', error);
        this.isLoadingLotes.set(false);
        alert('Error al cargar los productos del almacén');
      }
    });
  }

  abrirModalSeleccionarLote() {
    if (!this.idAlmacenOrigen()) {
      alert('Primero debe seleccionar un almacén de origen');
      return;
    }
    
    if (this.productosDisponibles().length === 0) {
      alert('No hay productos disponibles en este almacén');
      return;
    }
    
    this.modalSeleccionarLote.set(true);
    this.productosFiltrados.set(this.productosDisponibles());
    this.busquedaProducto.set('');
    this.resetearItemTemporal();
  }

  cerrarModalSeleccionarLote() {
    this.modalSeleccionarLote.set(false);
    this.resetearItemTemporal();
  }

  resetearItemTemporal() {
    this.itemTemporal.set({
      lote: null,
      cantidad: 0,
      precioVenta: 0
    });
  }

  buscarProductos() {
    const termino = this.busquedaProducto().toLowerCase();
    if (termino === '') {
      this.productosFiltrados.set(this.productosDisponibles());
    } else {
      const filtrados = this.productosDisponibles().filter(p => 
        p.nombreProducto.toLowerCase().includes(termino) ||
        p.marca.toLowerCase().includes(termino)
      );
      this.productosFiltrados.set(filtrados);
    }
  }

  seleccionarLote(lote: ProductoDetalle) {
    this.itemTemporal.update(item => ({
      ...item,
      lote,
      precioVenta: lote.precioUnitario // Precio base del lote
    }));
  }

  // Métodos auxiliares para actualizar itemTemporal desde el template
  actualizarCantidadItem(cantidad: number) {
    this.itemTemporal.update(item => ({
      ...item,
      cantidad
    }));
  }

  actualizarPrecioVentaItem(precioVenta: number) {
    this.itemTemporal.update(item => ({
      ...item,
      precioVenta
    }));
  }

  // Helper para obtener el ID de campos que pueden ser número u objeto
  obtenerIdUsuario(venta: Venta): number | undefined {
    return typeof venta.idUsuario === 'number' ? venta.idUsuario : venta.idUsuario?.id;
  }
  
  obtenerIdCliente(venta: Venta): number | undefined {
    return typeof venta.idCliente === 'number' ? venta.idCliente : venta.idCliente?.id;
  }
  
  obtenerIdMovimiento(venta: Venta): number | undefined {
    return typeof venta.idMovimiento === 'number' ? venta.idMovimiento : venta.idMovimiento?.id;
  }

  // Método auxiliar para obtener nombre del cliente
  obtenerNombreCliente(venta: Venta): string {
    const idCliente = this.obtenerIdCliente(venta);
    if (!idCliente) return 'N/A';
    const cliente = this.clientes().find(c => c.id === idCliente);
    return cliente ? cliente.nombre : `ID: ${idCliente}`;
  }

  // Método auxiliar para obtener nombre del usuario
  obtenerNombreUsuario(venta: Venta): string {
    const idUsuario = this.obtenerIdUsuario(venta);
    if (!idUsuario) return 'N/A';
    const usuario = this.usuarios().find(u => u.id === idUsuario);
    return usuario ? usuario.nombre : `ID: ${idUsuario}`;
  }

  agregarItemAVenta() {
    const item = this.itemTemporal();
    
    if (!item.lote) {
      alert('Debe seleccionar un producto');
      return;
    }
    
    if (item.cantidad <= 0) {
      alert('La cantidad debe ser mayor a 0');
      return;
    }
    
    if (item.cantidad > item.lote.stockActual) {
      alert(`La cantidad no puede ser mayor al stock disponible (${item.lote.stockActual})`);
      return;
    }
    
    if (item.precioVenta <= 0) {
      alert('El precio de venta debe ser mayor a 0');
      return;
    }
    
    // Verificar si el lote ya fue agregado
    const yaExiste = this.itemsVenta().some(i => i.idLote === item.lote!.numeroLote);
    if (yaExiste) {
      alert('Este producto ya fue agregado a la venta');
      return;
    }
    
    const nuevoItem: ItemVenta = {
      idLote: item.lote.numeroLote,
      nombreProducto: item.lote.nombreProducto,
      marca: item.lote.marca,
      stockDisponible: item.lote.stockActual,
      precioVenta: item.precioVenta,
      cantidad: item.cantidad,
      subtotal: item.cantidad * item.precioVenta
    };
    
    this.itemsVenta.update(items => [...items, nuevoItem]);
    this.cerrarModalSeleccionarLote();
  }

  eliminarItem(index: number) {
    this.itemsVenta.update(items => items.filter((_, i) => i !== index));
  }

  // --- REALIZAR VENTA ---
  
  confirmarRealizarVenta() {
    if (!this.validarFormulario()) {
      return;
    }
    
    const confirmar = confirm('¿Está seguro de realizar esta venta? Se actualizará el inventario.');
    if (confirmar) {
      this.realizarVenta();
    }
  }

  validarFormulario(): boolean {
    if (!this.idCliente()) {
      alert('Debe seleccionar un cliente');
      return false;
    }
    
    if (!this.referencia().trim()) {
      alert('Debe ingresar una referencia');
      return false;
    }
    
    if (!this.idAlmacenOrigen()) {
      alert('Debe seleccionar un almacén de origen');
      return false;
    }
    
    if (this.itemsVenta().length === 0) {
      alert('Debe agregar al menos un producto a la venta');
      return false;
    }
    
    return true;
  }

  realizarVenta() {
    this.isSaving.set(true);
    
    // Obtener fecha actual en formato ISO
    const fechaActual = new Date().toISOString();
    
    // Construir las líneas del movimiento
    const lineas: LineaMovimientoRequest[] = this.itemsVenta().map(item => ({
      idLoteExistente: item.idLote,
      cantidadDelta: item.cantidad, // no es Negativo para venta
      precioVenta: item.precioVenta,
      idAlmacenOrigen: this.idAlmacenOrigen()!,
      idAlmacenDestino: null // null para VENTA
    }));
    
    // Construir la solicitud
    const request: MovimientoGenerarRequest = {
      fecha: fechaActual,
      referencia: this.referencia(),
      comentario: this.comentario(),
      idUsuario: this.authService.getCurrentUserId()!,
      idTipoAccion: 4, // 4 = VENTA
      idCliente: this.idCliente()!,
      lineas: lineas
    };
    
    console.log('Enviando solicitud de venta:', JSON.stringify(request, null, 2));
    
    this.movimientosService.generarMovimiento(request).subscribe({
      next: (response) => {
        console.log('Respuesta del servidor:', response);
        this.isSaving.set(false);
        
        if (response.success) {
          alert('¡Venta realizada exitosamente!');
          this.cerrarModal();
          this.cargarDatos();
        } else {
          alert(`Error al realizar la venta: ${response.message}`);
        }
      },
      error: (error) => {
        console.error('Error al realizar la venta:', error);
        this.isSaving.set(false);
        const mensajeError = error.error?.message || error.message || 'Error desconocido';
        alert(`Error al realizar la venta: ${mensajeError}`);
      }
    });
  }

  // --- VER DETALLE DE VENTA ---
  
  abrirModalDetalle(venta: Venta) {
    const idMovimiento = this.obtenerIdMovimiento(venta);
    if (!idMovimiento) {
      alert('No se puede obtener el ID del movimiento');
      return;
    }

    this.ventaSeleccionada.set(venta);
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
        alert('Error al cargar el detalle de la venta');
      }
    });
  }

  cerrarModalDetalle() {
    this.modalDetalle.set(false);
    this.detalleLineas.set([]);
    this.ventaSeleccionada.set(null);
  }

  calcularTotalDetalle(): number {
    return this.detalleLineas().reduce((sum, linea) => {
      const cantidad = Math.abs(linea.cantidadDelta);
      const precio = linea.precioVenta || 0;
      return sum + (cantidad * precio);
    }, 0);
  }
}
