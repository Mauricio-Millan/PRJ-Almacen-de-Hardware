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

interface ItemAjuste {
  idLote: number;
  nombreProducto: string;
  marca: string;
  stockActual: number;
  cantidadAjuste: number; // Puede ser positivo o negativo
  tipo: 'incremento' | 'decremento';
}

@Component({
  selector: 'app-ajustes',
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './ajustes.html',
  styleUrls: ['./ajustes.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Ajustes implements OnInit {
  movimientos = signal<Movimiento[]>([]);
  almacenes = signal<Almacen[]>([]);
  productosDisponibles = signal<ProductoDetalle[]>([]);
  
  // Modal principal de nuevo ajuste
  modalVisible = signal(false);
  
  // Modal de selección de lotes
  modalSeleccionarLote = signal(false);
  productosFiltrados = signal<ProductoDetalle[]>([]);
  busquedaProducto = signal('');
  
  // Datos del formulario de ajuste
  referencia = signal('');
  comentario = signal('');
  idAlmacenOrigen = signal<number | null>(null);
  
  // Items agregados al ajuste
  itemsAjuste = signal<ItemAjuste[]>([]);
  
  // Item temporal al agregar producto
  itemTemporal = signal<{
    lote: ProductoDetalle | null;
    cantidadAjuste: number;
    tipo: 'incremento' | 'decremento';
  }>({
    lote: null,
    cantidadAjuste: 0,
    tipo: 'incremento'
  });
  
  // Computed para el total de ajustes
  totalAjuste = computed(() => {
    return this.itemsAjuste().reduce((sum, item) => 
      sum + (item.tipo === 'incremento' ? item.cantidadAjuste : -item.cantidadAjuste), 0
    );
  });

  almacenesActivos = computed(() => this.almacenes().filter(almacen => almacen.estado));
  
  // Loading states
  isLoading = signal(false);
  isSaving = signal(false);
  isLoadingLotes = signal(false);

  // Modal detalle de ajuste
  modalDetalle = signal(false);
  detalleLineas = signal<MovimientoLinea[]>([]);
  isLoadingDetalle = signal(false);
  ajusteSeleccionado = signal<Movimiento | null>(null);

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
        // Filtrar solo ajustes (idTipoAccion: 3)
        const ajustes = data.movimientos.filter(m => m.idTipoAccion.id === 3);
        this.movimientos.set(ajustes);
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
    this.itemsAjuste.set([]);
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
    // Limpiar items si se cambia el almacén
    this.itemsAjuste.set([]);
  }

  cargarLotesDelAlmacen(idAlmacen: number) {
    this.isLoadingLotes.set(true);
    this.almacenDetalleService.getAlmacenDetalle(idAlmacen).subscribe({
      next: (detalle) => {
        // Para ajustes, mostramos todos los lotes (incluso con stock 0)
        this.productosDisponibles.set(detalle.productos);
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
      alert('Primero debe seleccionar un almacén');
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
      cantidadAjuste: 0,
      tipo: 'incremento'
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
      cantidadAjuste: Math.abs(cantidad) // Siempre positivo, el signo lo da el tipo
    }));
  }

  actualizarTipoAjuste(tipo: 'incremento' | 'decremento') {
    this.itemTemporal.update(item => ({
      ...item,
      tipo
    }));
  }

  agregarItemAAjuste() {
    const item = this.itemTemporal();
    
    if (!item.lote) {
      alert('Debe seleccionar un producto');
      return;
    }
    
    if (item.cantidadAjuste <= 0) {
      alert('La cantidad debe ser mayor a 0');
      return;
    }
    
    // Verificar si el lote ya fue agregado
    const yaExiste = this.itemsAjuste().some(i => i.idLote === item.lote!.numeroLote);
    if (yaExiste) {
      alert('Este producto ya fue agregado al ajuste');
      return;
    }
    
    // Validar decrementos
    if (item.tipo === 'decremento' && item.cantidadAjuste > item.lote.stockActual) {
      alert(`No puede decrementar más del stock actual (${item.lote.stockActual})`);
      return;
    }
    
    const nuevoItem: ItemAjuste = {
      idLote: item.lote.numeroLote,
      nombreProducto: item.lote.nombreProducto,
      marca: item.lote.marca,
      stockActual: item.lote.stockActual,
      cantidadAjuste: item.cantidadAjuste,
      tipo: item.tipo
    };
    
    this.itemsAjuste.update(items => [...items, nuevoItem]);
    this.cerrarModalSeleccionarLote();
  }

  eliminarItem(index: number) {
    this.itemsAjuste.update(items => items.filter((_, i) => i !== index));
  }

  // Método auxiliar para obtener nombre del almacén
  obtenerNombreAlmacen(idAlmacen: number): string {
    const almacen = this.almacenes().find(a => a.id === idAlmacen);
    return almacen ? almacen.nombre : `Almacén #${idAlmacen}`;
  }

  confirmarRealizarAjuste() {
    if (!this.idAlmacenOrigen()) {
      alert('Debe seleccionar un almacén');
      return;
    }

    if (!this.referencia().trim()) {
      alert('Debe ingresar una referencia');
      return;
    }

    if (this.itemsAjuste().length === 0) {
      alert('Debe agregar al menos un producto al ajuste');
      return;
    }

    const almacen = this.obtenerNombreAlmacen(this.idAlmacenOrigen()!);
    const mensaje = `¿Confirma el ajuste de inventario en "${almacen}" con ${this.itemsAjuste().length} producto(s)?`;
    
    if (confirm(mensaje)) {
      this.realizarAjuste();
    }
  }

  realizarAjuste() {
    this.isSaving.set(true);

    // Obtener fecha actual en formato ISO
    const fechaActual = new Date().toISOString();

    // Construir el request para el endpoint unificado
    const request: MovimientoGenerarRequest = {
      fecha: fechaActual,
      referencia: this.referencia(),
      comentario: this.comentario() || '',
      idUsuario: this.authService.getCurrentUserId()!,
      idTipoAccion: 3, // AJUSTE
      lineas: this.itemsAjuste().map(item => ({
        cantidadDelta: item.tipo === 'decremento' ? -item.cantidadAjuste : item.cantidadAjuste,
        idLoteExistente: item.idLote,
        idAlmacenOrigen: this.idAlmacenOrigen()!,
        idAlmacenDestino: null
      } as LineaMovimientoRequest))
    };

    this.movimientosService.generarMovimiento(request).subscribe({
      next: (response) => {
        console.log('Ajuste realizado:', response);
        alert('Ajuste de inventario registrado exitosamente');
        this.cerrarModal();
        this.cargarDatos();
        this.isSaving.set(false);
      },
      error: (error) => {
        console.error('Error al realizar ajuste:', error);
        this.isSaving.set(false);
        const mensaje = error.error?.message || 'Error al procesar el ajuste';
        alert(`Error: ${mensaje}`);
      }
    });
  }

  // --- VER DETALLE DE AJUSTE ---

  obtenerIdMovimiento(movimiento: Movimiento): number | undefined {
    return movimiento.id;
  }
  
  abrirModalDetalle(movimiento: Movimiento) {
    const idMovimiento = this.obtenerIdMovimiento(movimiento);
    if (!idMovimiento) {
      alert('No se puede obtener el ID del movimiento');
      return;
    }

    this.ajusteSeleccionado.set(movimiento);
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
        alert('Error al cargar el detalle del ajuste');
      }
    });
  }

  cerrarModalDetalle() {
    this.modalDetalle.set(false);
    this.detalleLineas.set([]);
    this.ajusteSeleccionado.set(null);
  }

  obtenerNombreAlmacenDetalle(linea: MovimientoLinea): string {
    const idAlmacen = linea.idAlmacenOrigen?.id;
    if (!idAlmacen) return 'N/A';
    const almacen = this.almacenes().find(a => a.id === idAlmacen);
    return almacen ? almacen.nombre : `Almacén #${idAlmacen}`;
  }
}
