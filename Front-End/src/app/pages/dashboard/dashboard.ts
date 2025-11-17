import { Component, OnInit, OnDestroy, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
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
    this.totalVentas = ventas.length;
    const hoy = new Date().toISOString().split('T')[0];
    this.ventasHoy = ventas.filter(v => v.fecha?.startsWith(hoy)).length;
    
    const ventasAyer = ventas.filter(v => {
      const ayer = new Date();
      ayer.setDate(ayer.getDate() - 1);
      return v.fecha?.startsWith(ayer.toISOString().split('T')[0]);
    }).length;
    
    if (ventasAyer > 0) {
      const cambioNumber = parseFloat((((this.ventasHoy - ventasAyer) / ventasAyer) * 100).toFixed(1));
      const cambioStr = cambioNumber.toFixed(1);
      this.ventasChange = `${cambioNumber > 0 ? '+' : ''}${cambioStr}%`;
    }
    
    // Agrupar ventas por día de la semana
    const ventasPorDia = [0, 0, 0, 0, 0, 0, 0];
    ventas.forEach(v => {
      if (v.fecha) {
        const dia = new Date(v.fecha).getDay();
        ventasPorDia[dia === 0 ? 6 : dia - 1]++;
      }
    });
    this.barChartData.datasets[0].data = ventasPorDia;

    // Agrupar ventas por mes
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
    this.totalProductos = productos.length;
    this.productosActivos = productos.filter(p => p.estado === true).length;
    
    const porcentajeActivos = this.totalProductos > 0 
      ? ((this.productosActivos / this.totalProductos) * 100).toFixed(1) 
      : '0';
    this.productosChange = `${porcentajeActivos}% activos`;

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
    this.totalClientes = clientes.length;
    
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);
    
    this.clientesNuevos = clientes.filter(c => {
      if (c.fechaRegistro) {
        return new Date(c.fechaRegistro) >= hace30Dias;
      }
      return false;
    }).length;
    
    if (this.totalClientes > 0) {
      const porcentaje = ((this.clientesNuevos / this.totalClientes) * 100).toFixed(1);
      this.clientesChange = `${porcentaje}% nuevos`;
    }
  }

  processCompras(compras: any[]): void {
    this.totalCompras = compras.length;
    const hoy = new Date().toISOString().split('T')[0];
    this.comprasHoy = compras.filter(c => c.fecha?.startsWith(hoy)).length;
    
    const comprasAyer = compras.filter(c => {
      const ayer = new Date();
      ayer.setDate(ayer.getDate() - 1);
      return c.fecha?.startsWith(ayer.toISOString().split('T')[0]);
    }).length;
    
    if (comprasAyer > 0) {
      const cambioNumber = parseFloat(((this.comprasHoy - comprasAyer) / comprasAyer * 100).toFixed(1));
      this.comprasChange = `${cambioNumber > 0 ? '+' : ''}${cambioNumber.toFixed(1)}%`;
    }

    // Agrupar compras por día de la semana
    const comprasPorDia = [0, 0, 0, 0, 0, 0, 0];
    compras.forEach(c => {
      if (c.fecha) {
        const dia = new Date(c.fecha).getDay();
        comprasPorDia[dia === 0 ? 6 : dia - 1]++;
      }
    });
    this.barChartData.datasets[1].data = comprasPorDia;

    // Agrupar compras por mes
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