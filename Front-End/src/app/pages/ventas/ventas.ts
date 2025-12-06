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

interface UbigeoCiudad {
  nombre: string;
  distritos: string[];
}

interface UbigeoProvincia {
  nombre: string;
  ciudades: UbigeoCiudad[];
}

@Component({
  selector: 'app-ventas',
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './ventas.html',
  styleUrls: ['./ventas.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VentasComponent implements OnInit {
  readonly ubigeoPeru: UbigeoProvincia[] = [
    {
      nombre: 'Lima',
      ciudades: [
        {
          nombre: 'Lima Metropolitana',
          distritos: ['Miraflores', 'San Isidro', 'Santiago de Surco', 'La Molina', 'San Borja']
        },
        {
          nombre: 'Huaral',
          distritos: ['Huaral', 'Chancay', 'Aucallama']
        },
        {
          nombre: 'Barranca',
          distritos: ['Barranca', 'Paramonga', 'Supe']
        }
      ]
    },
    {
      nombre: 'Arequipa',
      ciudades: [
        {
          nombre: 'Arequipa',
          distritos: ['Cercado', 'Cayma', 'Yanahuara', 'Sachaca']
        },
        {
          nombre: 'Camaná',
          distritos: ['Camaná', 'Ocoña', 'Quilca']
        }
      ]
    },
    {
      nombre: 'Cusco',
      ciudades: [
        {
          nombre: 'Cusco',
          distritos: ['Cusco', 'San Jerónimo', 'San Sebastián', 'Wanchaq']
        },
        {
          nombre: 'Urubamba',
          distritos: ['Urubamba', 'Ollantaytambo', 'Machupicchu']
        }
      ]
    }
  ];

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
  provinciaSeleccionada = signal('');
  ciudadSeleccionada = signal('');
  distritoSeleccionado = signal('');
  codigoPostal = signal('');
  direccion = signal('');
  ciudadesDisponibles = signal<string[]>([]);
  distritosDisponibles = signal<string[]>([]);
  
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

  clientesActivos = computed(() => this.clientes().filter(cliente => cliente.estado));

  almacenesActivos = computed(() => this.almacenes().filter(almacen => almacen.estado));
  
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
    this.provinciaSeleccionada.set('');
    this.ciudadSeleccionada.set('');
    this.distritoSeleccionado.set('');
    this.codigoPostal.set('');
    this.direccion.set('');
    this.ciudadesDisponibles.set([]);
    this.distritosDisponibles.set([]);
    this.comentario.set('');
    this.idAlmacenOrigen.set(null);
    this.itemsVenta.set([]);
    this.productosDisponibles.set([]);
    this.resetearItemTemporal();
    this.actualizarComentarioDireccion();
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

  onProvinciaChange(value: string) {
    const provincia = value || '';
    this.provinciaSeleccionada.set(provincia);
    const provinciaInfo = this.ubigeoPeru.find(p => p.nombre === provincia);
    const ciudades = provinciaInfo ? provinciaInfo.ciudades.map(c => c.nombre) : [];
    this.ciudadesDisponibles.set(ciudades);
    this.ciudadSeleccionada.set('');
    this.distritoSeleccionado.set('');
    this.distritosDisponibles.set([]);
    this.actualizarComentarioDireccion();
  }

  onCiudadChange(value: string) {
    const ciudad = value || '';
    this.ciudadSeleccionada.set(ciudad);
    const provinciaInfo = this.ubigeoPeru.find(p => p.nombre === this.provinciaSeleccionada());
    const ciudadInfo = provinciaInfo?.ciudades.find(c => c.nombre === ciudad);
    const distritos = ciudadInfo ? ciudadInfo.distritos : [];
    this.distritosDisponibles.set(distritos);
    this.distritoSeleccionado.set('');
    this.actualizarComentarioDireccion();
  }

  onDistritoChange(value: string) {
    this.distritoSeleccionado.set(value || '');
    this.actualizarComentarioDireccion();
  }

  onCodigoPostalChange(value: string) {
    const sanitized = (value || '').replace(/[^0-9]/g, '').slice(0, 5);
    this.codigoPostal.set(sanitized);
    this.actualizarComentarioDireccion();
  }

  onDireccionChange(value: string) {
    this.direccion.set(value || '');
    this.actualizarComentarioDireccion();
  }

  private actualizarComentarioDireccion(): void {
    const partes: string[] = [];
    if (this.provinciaSeleccionada()) {
      partes.push(`Provincia: ${this.provinciaSeleccionada()}`);
    }
    if (this.ciudadSeleccionada()) {
      partes.push(`Ciudad: ${this.ciudadSeleccionada()}`);
    }
    if (this.distritoSeleccionado()) {
      partes.push(`Distrito: ${this.distritoSeleccionado()}`);
    }
    if (this.codigoPostal()) {
      partes.push(`C.P.: ${this.codigoPostal()}`);
    }
    if (this.direccion().trim()) {
      partes.push(`Dirección: ${this.direccion().trim()}`);
    }

    this.comentario.set(partes.join(' | '));
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

  setReferenciaNumerica(valor: string) {
    const soloNumeros = (valor || '').replace(/[^0-9]/g, '').slice(0, 8);
    this.referencia.set(soloNumeros);
  }

  private obtenerReferenciaFactura(): string {
    return this.referencia() ? `F${this.referencia()}` : '';
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
    
    if (!this.referencia()) {
      alert('Debe ingresar la numeración de la factura');
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

    if (!this.provinciaSeleccionada()) {
      alert('Debe seleccionar una provincia del Perú');
      return false;
    }

    if (!this.ciudadSeleccionada()) {
      alert('Debe seleccionar una ciudad');
      return false;
    }

    if (!this.distritoSeleccionado()) {
      alert('Debe seleccionar un distrito');
      return false;
    }

    if (!this.codigoPostal() || this.codigoPostal().length < 5) {
      alert('Debe ingresar un código postal válido de 5 dígitos');
      return false;
    }

    if (!this.direccion().trim()) {
      alert('Debe ingresar la dirección de entrega');
      return false;
    }
    
    return true;
  }

  realizarVenta() {
    this.isSaving.set(true);
    this.actualizarComentarioDireccion();
    
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
      referencia: this.obtenerReferenciaFactura(),
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

    forkJoin({
      lineas: this.movimientoLineasService.getMovimientoLineasByMovimiento(idMovimiento),
      movimiento: this.movimientosService.getMovimientoById(idMovimiento)
    }).subscribe({
      next: ({ lineas, movimiento }) => {
        this.detalleLineas.set(lineas);
        this.ventaSeleccionada.set({
          ...venta,
          comentario: movimiento?.comentario || venta.comentario,
          referencia: movimiento?.referencia || venta.referencia
        });
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

  calcularSubtotalSinIGV(): number {
    const total = this.calcularTotalDetalle();
    return parseFloat((total / 1.18).toFixed(2));
  }

  calcularIGV(): number {
    const total = this.calcularTotalDetalle();
    const subtotal = this.calcularSubtotalSinIGV();
    return parseFloat((total - subtotal).toFixed(2));
  }

  async exportarDetallePDF(): Promise<void> {
    if (!this.ventaSeleccionada()) return;

    try {
      const jspdfModule = await import('jspdf');
      const { jsPDF } = jspdfModule as any;
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const venta = this.ventaSeleccionada()!;
      const lineas = this.detalleLineas();
      const margin = 15;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const usableWidth = pageWidth - (margin * 2);
      let y = 18;

      const fechaHuman = venta.fecha ? new Date(venta.fecha).toLocaleString('es-PE') : 'Fecha no disponible';
      const direccionCliente = venta.comentario || 'Dirección no registrada';

      // --- Encabezado de empresa ---
      pdf.setFontSize(14);
      pdf.setTextColor(31, 41, 55);
      pdf.text('Almacén de Hardware S.A.C.', margin, y);
      pdf.setFontSize(10);
      y += 6;
      pdf.text('RUC 20609999999', margin, y);
      y += 5;
      pdf.text('Av. Tecnológica 456 - Lima, Perú', margin, y);
      y += 5;
      pdf.text('Tel: (01) 555-1234', margin, y);

      pdf.setFontSize(12);
      pdf.setTextColor(79, 70, 229);
      pdf.text(`Factura: VEN-${venta.id}`, pageWidth - margin, 20, { align: 'right' });
      pdf.setTextColor(31, 41, 55);
      pdf.setFontSize(10);
      pdf.text(`Emitida: ${fechaHuman}`, pageWidth - margin, 26, { align: 'right' });
      pdf.text(`Usuario: ${this.obtenerNombreUsuario(venta)}`, pageWidth - margin, 32, { align: 'right' });

      y += 12;
      pdf.setDrawColor(226, 232, 240);
      pdf.line(margin, y, pageWidth - margin, y);
      y += 10;

      // --- Datos del cliente ---
      pdf.setFontSize(11);
      pdf.setFont(undefined, 'bold');
      pdf.text('Datos del Cliente', margin, y);
      pdf.setFont(undefined, 'normal');
      y += 6;
      pdf.setFontSize(10);
      pdf.text(`Cliente: ${this.obtenerNombreCliente(venta)}`, margin, y);
      y += 5;
      pdf.text(`Referencia: ${venta.referencia || 'Sin referencia'}`, margin, y);
      y += 5;
      const direccionLineas = pdf.splitTextToSize(`Dirección: ${direccionCliente}`, usableWidth);
      direccionLineas.forEach((lineaDir: string) => {
        pdf.text(lineaDir, margin, y);
        y += 4;
      });
      y += 4;

      // --- Tabla de detalle ---
      const headerY = y;
      const colHeaders = ['Cant.', 'Descripción', 'Marca', 'Lote', 'P. Unit.', 'Subtotal'];
      const colWidths = [18, 62, 30, 22, 28, 30];

      const dibujarEncabezado = (posY: number) => {
        pdf.setFillColor(238, 242, 255);
        pdf.setDrawColor(199, 210, 254);
        pdf.rect(margin, posY - 6, usableWidth, 8, 'FD');
        pdf.setFontSize(9);
        pdf.setFont(undefined, 'bold');
        let x = margin + 2;
        colHeaders.forEach((header, index) => {
          const colWidth = colWidths[index];
          const align = index >= colHeaders.length - 2 ? 'right' : (index === 0 ? 'center' : 'left');
          pdf.text(header, align === 'center' ? x + colWidth / 2 : x, posY, { align: align as any });
          x += colWidth;
        });
        pdf.setFont(undefined, 'normal');
      };

      dibujarEncabezado(headerY);
      y = headerY + 6;
      pdf.setFontSize(9);

      lineas.forEach((linea, idx) => {
        if (y > 260) {
          pdf.addPage();
          y = 20;
          dibujarEncabezado(y);
          y += 6;
        }

        const cantidad = Math.abs(linea.cantidadDelta);
        const producto = linea.idLote.idProducto.nombre || 'Producto';
        const marca = linea.idLote.idProducto.idMarca.nombre || 'Marca';
        const lote = `#${linea.idLote.id}`;
        const precioUnit = (linea.precioVenta || 0).toFixed(2);
        const subtotal = (cantidad * (linea.precioVenta || 0)).toFixed(2);

        let x = margin + 2;
        const rowValues = [
          cantidad.toString(),
          producto,
          marca,
          lote,
          `S/ ${precioUnit}`,
          `S/ ${subtotal}`
        ];

        rowValues.forEach((valor, index) => {
          const colWidth = colWidths[index];
          const align = index >= rowValues.length - 2 ? 'right' : (index === 0 ? 'center' : 'left');
          const text = index === 1 ? valor : valor.substring(0, 25);
          pdf.text(text, align === 'center' ? x + colWidth / 2 : x, y, { align: align as any });
          x += colWidth;
        });

        y += 6;
        if (idx < lineas.length - 1) {
          pdf.setDrawColor(243, 244, 246);
          pdf.line(margin, y - 4, pageWidth - margin, y - 4);
        }
      });

      y += 10;
      if (y > 250) {
        pdf.addPage();
        y = 20;
      }

      // --- Totales ---
      const subtotal = this.calcularSubtotalSinIGV();
      const igv = this.calcularIGV();
      const total = this.calcularTotalDetalle();

      pdf.setFontSize(10);
      pdf.setFont(undefined, 'bold');
      pdf.text('Resumen de Pago', margin, y);
      pdf.setFont(undefined, 'normal');
      y += 6;

      pdf.setFontSize(10);
      const totalsX = pageWidth - margin;
      const drawTotalLine = (label: string, value: number, bold = false) => {
        pdf.setFont(undefined, bold ? 'bold' : 'normal');
        pdf.text(label, totalsX - 60, y, { align: 'right' });
        pdf.text(`S/ ${value.toFixed(2)}`, totalsX, y, { align: 'right' });
        y += 6;
      };

      drawTotalLine('Base Imponible', subtotal);
      drawTotalLine('IGV (18%)', igv);
      drawTotalLine('Total a Pagar', total, true);

      y += 4;
      if (y > 250) {
        pdf.addPage();
        y = 20;
      }

      pdf.setFontSize(9);
      pdf.setFont(undefined, 'bold');
      pdf.text('Observaciones / Dirección de entrega', margin, y);
      pdf.setFont(undefined, 'normal');
      y += 5;
      const obsLines = pdf.splitTextToSize(direccionCliente, usableWidth);
      obsLines.forEach((lineObs: string) => {
        pdf.text(lineObs, margin, y);
        y += 4;
      });

      // Guardar PDF
      const fecha = venta.fecha ? new Date(venta.fecha).toISOString().split('T')[0] : 'sin-fecha';
      pdf.save(`venta-factura-${venta.id}-${fecha}.pdf`);
      
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      alert('Error al generar el PDF. Por favor, intente nuevamente.');
    }
  }
}
