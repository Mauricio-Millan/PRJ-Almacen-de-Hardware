import { Component, OnInit, OnDestroy, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { VentasService } from '../../core/services/ventas';
import { ProductosService } from '../../core/services/producto';
import { ClientesService } from '../../core/services/cliente';
import { ComprasService } from '../../core/services/compras';
import { forkJoin, Subscription } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  // Filtros de fecha
  fechaDesde: string = '';
  fechaHasta: string = '';

  // Control de semanas para el gráfico semanal
  semanaActual: number = 0; // 0 = semana actual, -1 = semana anterior, etc.
  fechaInicioSemana: Date = new Date();
  fechaFinSemana: Date = new Date();
  infoSemana: string = '';

  // Métricas principales
  totalVentas: number = 0;
  totalCompras: number = 0;
  totalProductos: number = 0;
  totalClientes: number = 0;
  ventasHoy: number = 0;
  comprasHoy: number = 0;
  productosActivos: number = 0;
  clientesNuevos: number = 0;

  // Porcentajes de cambio
  ventasChange: string = '+0%';
  comprasChange: string = '+0%';
  productosChange: string = '+0%';
  clientesChange: string = '+0%';

  // Datos para la tabla "Mejores Productos"
  bestProducts: any[] = [];
  // Estado export
  isExporting: boolean = false;

  // Configuración Chart
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: { x: {}, y: { min: 0 } },
    plugins: { legend: { display: true } }
  };
  public barChartType: ChartType = 'bar';

  // Chart: Ventas y Compras por día de la semana
  public barChartData: ChartData<'bar'> = {
    labels: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
    datasets: [
      { data: [0, 0, 0, 0, 0, 0, 0], label: 'Ventas', backgroundColor: '#3b82f6' },
      { data: [0, 0, 0, 0, 0, 0, 0], label: 'Compras', backgroundColor: '#8b5cf6' }
    ]
  };

  // Chart: Ventas por mes
  public targetChartData: ChartData<'bar'> = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    datasets: [
      { data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], label: 'Ventas Mensuales', backgroundColor: '#10b981' }
    ]
  };

  // Chart: Compras por mes
  public volumeChartData: ChartData<'bar'> = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    datasets: [
      { data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], label: 'Compras Mensuales', backgroundColor: '#f59e0b' }
    ]
  };

  constructor(
    private ventasService: VentasService,
    private productosService: ProductosService,
    private clientesService: ClientesService,
    private comprasService: ComprasService
    , private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  @ViewChildren(BaseChartDirective) charts!: QueryList<BaseChartDirective>;

  

  loadDashboardData(): void {
    forkJoin({
      ventas: this.ventasService.getVentas(),
      productos: this.productosService.getProductos(),
      clientes: this.clientesService.getClientes(),
      compras: this.comprasService.getCompras()
    }).subscribe({
      next: (data) => {
        // Normalizar respuestas posibles (array directo o { data: [...] })
        const ventas = this.normalizeArray(data.ventas);
        const productos = this.normalizeArray(data.productos);
        const clientes = this.normalizeArray(data.clientes);
        const compras = this.normalizeArray(data.compras);

        // Debug: imprimir resumen para verificar qué llega cuando se vuelve al dashboard
        try {
          console.debug('Dashboard: datos recibidos', {
            ventasCount: ventas.length,
            comprasCount: compras.length,
            productosCount: productos.length,
            clientesCount: clientes.length,
            sampleVentas: ventas.slice(0, 3),
            sampleProductos: productos.slice(0, 3)
          });
        } catch (e) {
          console.debug('Dashboard: error al loggear datos', e);
        }

        this.processVentas(ventas);
        this.processProductos(productos);
        this.processClientes(clientes);
        this.processCompras(compras);
        // Forzar refresco de los charts después de procesar datos
        this.refreshCharts();
      },
      error: (error) => {
        console.error('Error al cargar datos del dashboard:', error);
      }
    });
  }

  private normalizeArray(input: any): any[] {
    if (!input) return [];
    if (Array.isArray(input)) return input;
    if (input.data && Array.isArray(input.data)) return input.data;
    if (input.items && Array.isArray(input.items)) return input.items;
    return [];
  }

  private routerSub?: Subscription;

  ngOnInit(): void {
    // Inicializar fechas: últimos 30 días por defecto
    const hoy = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(hoy.getDate() - 30);
    
    this.fechaHasta = this.formatDateForInput(hoy);
    this.fechaDesde = this.formatDateForInput(hace30Dias);

    // Inicializar semana actual
    this.calcularRangoSemana();

    // Asegurar que al navegar de vuelta los datos se refresquen si el componente fue reutilizado
    this.routerSub = this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((ev: any) => {
      // Si la URL contiene 'dashboard' forzamos recarga de métricas
      if (ev.url && ev.url.includes('/dashboard')) {
        this.loadDashboardData();
      }
    });
    // Primera carga
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    if (this.routerSub) this.routerSub.unsubscribe();
  }

  // Formatear fecha para input type="date" (YYYY-MM-DD)
  private formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Filtrar datos por rango de fechas
  private filtrarPorFechas(items: any[]): any[] {
    if (!this.fechaDesde && !this.fechaHasta) return items;
    
    const desde = this.fechaDesde ? new Date(this.fechaDesde) : null;
    const hasta = this.fechaHasta ? new Date(this.fechaHasta) : null;
    
    // Ajustar hasta para incluir todo el día
    if (hasta) {
      hasta.setHours(23, 59, 59, 999);
    }
    
    return items.filter(item => {
      if (!item.fecha) return false;
      const fechaItem = new Date(item.fecha);
      
      if (desde && fechaItem < desde) return false;
      if (hasta && fechaItem > hasta) return false;
      
      return true;
    });
  }

  // Método público para aplicar filtros desde el template
  aplicarFiltros(): void {
    this.loadDashboardData();
  }

  // Limpiar filtros y volver a valores por defecto
  limpiarFiltros(): void {
    const hoy = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(hoy.getDate() - 30);
    
    this.fechaHasta = this.formatDateForInput(hoy);
    this.fechaDesde = this.formatDateForInput(hace30Dias);
    
    this.loadDashboardData();
  }

  // --- NAVEGACIÓN POR SEMANAS ---

  private calcularRangoSemana(): void {
    const hoy = new Date();
    const diaSemana = hoy.getDay(); // 0 = Domingo, 1 = Lunes, ...
    const diasDesdeInicio = diaSemana === 0 ? 6 : diaSemana - 1; // Lunes como inicio
    
    // Calcular inicio de la semana actual
    const inicioSemanaBase = new Date(hoy);
    inicioSemanaBase.setDate(hoy.getDate() - diasDesdeInicio);
    
    // Ajustar según semanaActual
    this.fechaInicioSemana = new Date(inicioSemanaBase);
    this.fechaInicioSemana.setDate(inicioSemanaBase.getDate() + (this.semanaActual * 7));
    this.fechaInicioSemana.setHours(0, 0, 0, 0);
    
    // Calcular fin de semana (Domingo)
    this.fechaFinSemana = new Date(this.fechaInicioSemana);
    this.fechaFinSemana.setDate(this.fechaInicioSemana.getDate() + 6);
    this.fechaFinSemana.setHours(23, 59, 59, 999);
    
    // Generar texto informativo
    this.generarInfoSemana();
  }

  private generarInfoSemana(): void {
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    const diaInicio = this.fechaInicioSemana.getDate();
    const mesInicio = meses[this.fechaInicioSemana.getMonth()];
    const diaFin = this.fechaFinSemana.getDate();
    const mesFin = meses[this.fechaFinSemana.getMonth()];
    const año = this.fechaFinSemana.getFullYear();
    
    if (this.semanaActual === 0) {
      this.infoSemana = `Semana Actual: ${diaInicio} ${mesInicio} - ${diaFin} ${mesFin} ${año}`;
    } else if (this.semanaActual === -1) {
      this.infoSemana = `Semana Pasada: ${diaInicio} ${mesInicio} - ${diaFin} ${mesFin} ${año}`;
    } else if (this.semanaActual < -1) {
      this.infoSemana = `Hace ${Math.abs(this.semanaActual)} semanas: ${diaInicio} ${mesInicio} - ${diaFin} ${mesFin} ${año}`;
    } else {
      this.infoSemana = `Semana Futura: ${diaInicio} ${mesInicio} - ${diaFin} ${mesFin} ${año}`;
    }
  }

  cambiarSemana(direccion: number): void {
    this.semanaActual += direccion;
    this.calcularRangoSemana();
    this.loadDashboardData();
  }

  volverSemanaActual(): void {
    this.semanaActual = 0;
    this.calcularRangoSemana();
    this.loadDashboardData();
  }

  private filtrarPorSemana(items: any[]): any[] {
    return items.filter(item => {
      if (!item.fecha) return false;
      const fechaItem = new Date(item.fecha);
      return fechaItem >= this.fechaInicioSemana && fechaItem <= this.fechaFinSemana;
    });
  }

  private refreshCharts(): void {
    // Detect changes then call update on each BaseChartDirective
    try {
      this.cdr.detectChanges();
      if (this.charts && this.charts.length) {
        this.charts.forEach(c => {
          try { c.update(); } catch (e) { /* ignore individual chart errors */ }
        });
      }
    } catch (e) {
      console.debug('Dashboard: error refreshing charts', e);
    }
  }

  // Export dashboard as PDF using dynamic imports (html2canvas + jspdf)
  async exportDashboardPDF(): Promise<void> {
    this.isExporting = true;
    try {
      const html2canvasModule = await import('html2canvas');
      const html2canvas = html2canvasModule.default || html2canvasModule;
      const jspdfModule = await import('jspdf');
      const { jsPDF } = jspdfModule as any;

      const el = document.getElementById('dashboard-content');
      if (!el) throw new Error('Contenido del dashboard no encontrado');

      // Render element to canvas (increase scale for better quality)
      const canvas = await html2canvas(el, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');

      // Create PDF (landscape to better fit dashboards)
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Image size keeping aspect ratio
      const imgProps = (pdf as any).getImageProperties(imgData);
      const imgWidth = pdfWidth;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

      // If image height is greater than page, add it and create extra pages
      if (imgHeight <= pdfHeight) {
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      } else {
        let position = 0;
        let remainingHeight = imgHeight;
        // Split vertically into pages
        while (remainingHeight > 0) {
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          remainingHeight -= pdfHeight;
          position -= pdfHeight;
          if (remainingHeight > 0) pdf.addPage();
        }
      }

      pdf.save('dashboard.pdf');
    } catch (err: any) {
      console.error('Error exportando PDF:', err);
      alert('Error al exportar PDF: ' + (err?.message || err));
    } finally {
      this.isExporting = false;
    }
  }

  processVentas(ventas: any[]): void {
    // Obtener mes y año actual
    const hoy = new Date();
    const mesActual = hoy.getMonth();
    const añoActual = hoy.getFullYear();
    
    // Filtrar ventas del mes actual
    const ventasMesActual = ventas.filter(v => {
      if (!v.fecha) return false;
      const fechaVenta = new Date(v.fecha);
      return fechaVenta.getMonth() === mesActual && fechaVenta.getFullYear() === añoActual;
    });
    
    // Filtrar ventas del mes anterior
    const mesAnterior = mesActual === 0 ? 11 : mesActual - 1;
    const añoMesAnterior = mesActual === 0 ? añoActual - 1 : añoActual;
    const ventasMesAnterior = ventas.filter(v => {
      if (!v.fecha) return false;
      const fechaVenta = new Date(v.fecha);
      return fechaVenta.getMonth() === mesAnterior && fechaVenta.getFullYear() === añoMesAnterior;
    });
    
    // Total de ventas del mes actual
    this.totalVentas = ventasMesActual.length;
    this.ventasHoy = ventasMesActual.length;
    
    // Calcular cambio porcentual comparando meses
    const totalMesAnterior = ventasMesAnterior.length;
    if (totalMesAnterior > 0) {
      const cambioNumber = parseFloat((((this.totalVentas - totalMesAnterior) / totalMesAnterior) * 100).toFixed(1));
      this.ventasChange = `${cambioNumber > 0 ? '+' : ''}${cambioNumber}%`;
    } else if (this.totalVentas > 0) {
      this.ventasChange = '+100%';
    } else {
      this.ventasChange = '0%';
    }
    
    // Agrupar ventas por día de la semana (usando datos de la semana seleccionada)
    const ventasSemana = this.filtrarPorSemana(ventas);
    const ventasPorDia = [0, 0, 0, 0, 0, 0, 0];
    ventasSemana.forEach(v => {
      if (v.fecha) {
        const dia = new Date(v.fecha).getDay();
        ventasPorDia[dia === 0 ? 6 : dia - 1]++;
      }
    });
    this.barChartData.datasets[0].data = ventasPorDia;

    // Agrupar ventas por mes (usando TODAS las ventas sin filtro de rango)
    const ventasPorMes = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    ventas.forEach(v => {
      if (v.fecha) {
        const mes = new Date(v.fecha).getMonth();
        ventasPorMes[mes]++;
      }
    });
    this.targetChartData.datasets[0].data = ventasPorMes;
  }

  processProductos(productos: any[]): void {
    // Total de todos los productos
    this.totalProductos = productos.length;
    
    // Productos activos
    this.productosActivos = productos.filter(p => p.estado === true).length;
    
    // Mostrar cantidad de productos activos en la tarjeta
    this.productosChange = `${this.productosActivos} activos`;

    // Top productos (simulando popularidad basada en estado)
    this.bestProducts = productos
      .filter(p => p.estado)
      .slice(0, 4)
      .map((p, index) => ({
        name: p.nombre,
        popularity: Math.max(20, 60 - (index * 10)),
        sales: Math.max(20, 60 - (index * 10))
      }));
  }

  processClientes(clientes: any[]): void {
    // Total de todos los clientes
    this.totalClientes = clientes.length;
    
    // Clientes nuevos del mes actual
    const hoy = new Date();
    const mesActual = hoy.getMonth();
    const añoActual = hoy.getFullYear();
    
    this.clientesNuevos = clientes.filter(c => {
      if (c.fechaRegistro) {
        const fechaRegistro = new Date(c.fechaRegistro);
        return fechaRegistro.getMonth() === mesActual && fechaRegistro.getFullYear() === añoActual;
      }
      return false;
    }).length;
    
    // Mostrar clientes nuevos del mes
    this.clientesChange = `${this.clientesNuevos} nuevos este mes`;
  }

  processCompras(compras: any[]): void {
    // Obtener mes y año actual
    const hoy = new Date();
    const mesActual = hoy.getMonth();
    const añoActual = hoy.getFullYear();
    
    // Filtrar compras del mes actual
    const comprasMesActual = compras.filter(c => {
      if (!c.fecha) return false;
      const fechaCompra = new Date(c.fecha);
      return fechaCompra.getMonth() === mesActual && fechaCompra.getFullYear() === añoActual;
    });
    
    // Filtrar compras del mes anterior
    const mesAnterior = mesActual === 0 ? 11 : mesActual - 1;
    const añoMesAnterior = mesActual === 0 ? añoActual - 1 : añoActual;
    const comprasMesAnterior = compras.filter(c => {
      if (!c.fecha) return false;
      const fechaCompra = new Date(c.fecha);
      return fechaCompra.getMonth() === mesAnterior && fechaCompra.getFullYear() === añoMesAnterior;
    });
    
    // Total de compras del mes actual
    this.totalCompras = comprasMesActual.length;
    this.comprasHoy = comprasMesActual.length;
    
    // Calcular cambio porcentual comparando meses
    const totalMesAnterior = comprasMesAnterior.length;
    if (totalMesAnterior > 0) {
      const cambioNumber = parseFloat(((this.totalCompras - totalMesAnterior) / totalMesAnterior * 100).toFixed(1));
      this.comprasChange = `${cambioNumber > 0 ? '+' : ''}${cambioNumber}%`;
    } else if (this.totalCompras > 0) {
      this.comprasChange = '+100%';
    } else {
      this.comprasChange = '0%';
    }

    // Agrupar compras por día de la semana (usando datos de la semana seleccionada)
    const comprasSemana = this.filtrarPorSemana(compras);
    const comprasPorDia = [0, 0, 0, 0, 0, 0, 0];
    comprasSemana.forEach(c => {
      if (c.fecha) {
        const dia = new Date(c.fecha).getDay();
        comprasPorDia[dia === 0 ? 6 : dia - 1]++;
      }
    });
    this.barChartData.datasets[1].data = comprasPorDia;

    // Agrupar compras por mes (usando TODAS las compras sin filtro de rango)
    const comprasPorMes = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    compras.forEach(c => {
      if (c.fecha) {
        const mes = new Date(c.fecha).getMonth();
        comprasPorMes[mes]++;
      }
    });
    this.volumeChartData.datasets[0].data = comprasPorMes;
  }
}