import { Component, OnInit, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Movimiento } from '../../core/models/movimiento';
import { MovimientoLinea } from '../../core/models/movimiento-linea';
import { Almacen } from '../../core/models/almacen';
import { ProductoDetalle } from '../../core/models/almacendetalle';
import { MovimientosService } from '../../core/services/movimientos';
import { MovimientoLineasService } from '../../core/services/movimiento-lineas';
import { Almacenes } from '../../core/services/almacenes';
import { AlmacendetalleService } from '../../core/services/almacendetalleservice';
import { AuthService } from '../../core/services/auth.service';
import { MovimientoGenerarRequest, LineaMovimientoRequest } from '../../core/models/movimiento-generar-request';

interface ItemTransferencia {
  idLote: number;
  nombreProducto: string;
  marca: string;
  stockDisponible: number;
  cantidad: number;
}

@Component({
  selector: 'app-movimientos',
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './movimientos.html',
  styleUrls: ['./movimientos.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Movimientos implements OnInit {
  movimientos = signal<Movimiento[]>([]);
  almacenes = signal<Almacen[]>([]);
  productosDisponibles = signal<ProductoDetalle[]>([]);
  
  // Modal principal de nueva transferencia
  modalVisible = signal(false);
  
  // Modal de selección de lotes
  modalSeleccionarLote = signal(false);
  productosFiltrados = signal<ProductoDetalle[]>([]);
  busquedaProducto = signal('');
  
  // Datos del formulario de transferencia
  referencia = signal('');
  comentario = signal('');
  idAlmacenOrigen = signal<number | null>(null);
  idAlmacenDestino = signal<number | null>(null);
  
  // Items agregados a la transferencia
  itemsTransferencia = signal<ItemTransferencia[]>([]);
  
  // Item temporal al agregar producto
  itemTemporal = signal<{
    lote: ProductoDetalle | null;
    cantidad: number;
  }>({
    lote: null,
    cantidad: 0
  });
  
  // Computed para validar que los almacenes sean diferentes
  almacenesValidos = computed(() => {
    const origen = this.idAlmacenOrigen();
    const destino = this.idAlmacenDestino();
    return origen !== null && destino !== null && origen !== destino;
  });
  
  // Loading states
  isLoading = signal(false);
  isSaving = signal(false);
  isLoadingLotes = signal(false);

  // Modal detalle de movimiento
  modalDetalle = signal(false);
  detalleLineas = signal<MovimientoLinea[]>([]);
  isLoadingDetalle = signal(false);
  movimientoSeleccionado = signal<Movimiento | null>(null);

  // Para usar Math en el template
  Math = Math;

  constructor(
    private movimientosService: MovimientosService,
    private movimientoLineasService: MovimientoLineasService,
    private almacenesService: Almacenes,
    private almacenDetalleService: AlmacendetalleService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos() {
    this.isLoading.set(true);
    forkJoin({
      movimientos: this.movimientosService.getMovimientos(),
      almacenes: this.almacenesService.getAlmacenes()
    }).subscribe({
      next: (data) => {
        // Filtrar solo transferencias (idTipoAccion: 2)
        const transferencias = data.movimientos.filter(m => m.idTipoAccion.id === 2);
        this.movimientos.set(transferencias);
        this.almacenes.set(data.almacenes);
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
    this.referencia.set('');
    this.comentario.set('');
    this.idAlmacenOrigen.set(null);
    this.idAlmacenDestino.set(null);
    this.itemsTransferencia.set([]);
    this.productosDisponibles.set([]);
    this.resetearItemTemporal();
  }

  // --- GESTIÓN DE LOTES/PRODUCTOS ---
  
  onAlmacenOrigenChange() {
    const idAlmacen = this.idAlmacenOrigen();
    if (idAlmacen) {
      this.cargarLotesDelAlmacen(idAlmacen);
    } else {
      this.productosDisponibles.set([]);
    }
    // Limpiar items si se cambia el almacén origen
    this.itemsTransferencia.set([]);
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
      cantidad: 0
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
      lote
    }));
  }

  // Métodos auxiliares para actualizar itemTemporal desde el template
  actualizarCantidadItem(cantidad: number) {
    this.itemTemporal.update(item => ({
      ...item,
      cantidad
    }));
  }

  agregarItemATransferencia() {
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
    
    // Verificar si el lote ya fue agregado
    const yaExiste = this.itemsTransferencia().some(i => i.idLote === item.lote!.numeroLote);
    if (yaExiste) {
      alert('Este producto ya fue agregado a la transferencia');
      return;
    }
    
    const nuevoItem: ItemTransferencia = {
      idLote: item.lote.numeroLote,
      nombreProducto: item.lote.nombreProducto,
      marca: item.lote.marca,
      stockDisponible: item.lote.stockActual,
      cantidad: item.cantidad
    };
    
    this.itemsTransferencia.update(items => [...items, nuevoItem]);
    this.cerrarModalSeleccionarLote();
  }

  eliminarItem(index: number) {
    this.itemsTransferencia.update(items => items.filter((_, i) => i !== index));
  }

  // Método auxiliar para obtener nombre del almacén
  obtenerNombreAlmacen(idAlmacen: number): string {
    const almacen = this.almacenes().find(a => a.id === idAlmacen);
    return almacen ? almacen.nombre : `Almacén #${idAlmacen}`;
  }

  confirmarRealizarTransferencia() {
    if (!this.idAlmacenOrigen()) {
      alert('Debe seleccionar un almacén de origen');
      return;
    }

    if (!this.idAlmacenDestino()) {
      alert('Debe seleccionar un almacén de destino');
      return;
    }

    if (!this.almacenesValidos()) {
      alert('El almacén de origen y destino deben ser diferentes');
      return;
    }

    if (!this.referencia().trim()) {
      alert('Debe ingresar una referencia');
      return;
    }

    if (this.itemsTransferencia().length === 0) {
      alert('Debe agregar al menos un producto a la transferencia');
      return;
    }

    const origen = this.obtenerNombreAlmacen(this.idAlmacenOrigen()!);
    const destino = this.obtenerNombreAlmacen(this.idAlmacenDestino()!);
    const mensaje = `¿Confirma la transferencia de ${this.itemsTransferencia().length} producto(s) de "${origen}" a "${destino}"?`;
    
    if (confirm(mensaje)) {
      this.realizarTransferencia();
    }
  }

  realizarTransferencia() {
    this.isSaving.set(true);

    // Obtener fecha actual en formato ISO
    const fechaActual = new Date().toISOString();

    // Construir el request para el endpoint unificado
    const request: MovimientoGenerarRequest = {
      fecha: fechaActual,
      referencia: this.referencia(),
      comentario: this.comentario() || '',
      idUsuario: this.authService.getCurrentUserId()!,
      idTipoAccion: 2, // TRANSFERENCIA
      lineas: this.itemsTransferencia().map(item => ({
        cantidadDelta: item.cantidad, // Positivo para transferencias
        idLoteExistente: item.idLote,
        idAlmacenOrigen: this.idAlmacenOrigen()!,
        idAlmacenDestino: this.idAlmacenDestino()!
      } as LineaMovimientoRequest))
    };

    this.movimientosService.generarMovimiento(request).subscribe({
      next: (response) => {
        console.log('Transferencia realizada:', response);
        alert('Transferencia registrada exitosamente');
        this.cerrarModal();
        this.cargarDatos();
        this.isSaving.set(false);
      },
      error: (error) => {
        console.error('Error al realizar transferencia:', error);
        this.isSaving.set(false);
        const mensaje = error.error?.message || 'Error al procesar la transferencia';
        alert(`Error: ${mensaje}`);
      }
    });
  }

  // --- VER DETALLE DE MOVIMIENTO ---

  obtenerIdMovimiento(movimiento: Movimiento): number | undefined {
    return movimiento.id;
  }
  
  abrirModalDetalle(movimiento: Movimiento) {
    const idMovimiento = this.obtenerIdMovimiento(movimiento);
    if (!idMovimiento) {
      alert('No se puede obtener el ID del movimiento');
      return;
    }

    this.movimientoSeleccionado.set(movimiento);
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
        alert('Error al cargar el detalle del movimiento');
      }
    });
  }

  cerrarModalDetalle() {
    this.modalDetalle.set(false);
    this.detalleLineas.set([]);
    this.movimientoSeleccionado.set(null);
  }

  obtenerNombreAlmacenDetalle(linea: MovimientoLinea, tipo: 'origen' | 'destino'): string {
    const idAlmacen = tipo === 'origen' ? linea.idAlmacenOrigen?.id : linea.idAlmacenDestino?.id;
    if (!idAlmacen) return 'N/A';
    const almacen = this.almacenes().find(a => a.id === idAlmacen);
    return almacen ? almacen.nombre : `Almacén #${idAlmacen}`;
  }
}
