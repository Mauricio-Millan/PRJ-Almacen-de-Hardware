import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective], // Importa BaseChartDirective
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent {
  // Datos para la tabla "Mejores Productos"
  bestProducts = [
    { name: 'Home Decor Range', popularity: 45, sales: 45 },
    { name: 'Disney Princess Pink Bag 18"', popularity: 29, sales: 29 },
    { name: 'Bathroom Essentials', popularity: 18, sales: 18 },
    { name: 'Apple Smartwatches', popularity: 25, sales: 25 },
  ];

  // Configuración Chart: Total Revenue
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: { x: {}, y: { min: 0 } },
    plugins: { legend: { display: true } }
  };
  public barChartType: ChartType = 'bar';
  public barChartData: ChartData<'bar'> = {
    labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    datasets: [
      { data: [12, 18, 8, 15, 12, 18, 10], label: 'Online Sales' },
      { data: [15, 22, 18, 20, 16, 22, 15], label: 'Offline Sales' }
    ]
  };

  // Configuración Chart: Target vs Reality
  public targetChartData: ChartData<'bar'> = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July'],
    datasets: [
      { data: [18, 15, 17, 22, 19, 21, 23], label: 'Reality Sales' },
      { data: [20, 18, 19, 24, 21, 23, 25], label: 'Target Sales' }
    ]
  };

  // Configuración Chart: Volume vs Service Level
  public volumeChartData: ChartData<'bar'> = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      { data: [100, 120, 150, 130, 160, 140, 170], label: 'Volume', stack: 'a' },
      { data: [80, 90, 110, 100, 120, 110, 130], label: 'Services', stack: 'a' }
    ]
  };
}