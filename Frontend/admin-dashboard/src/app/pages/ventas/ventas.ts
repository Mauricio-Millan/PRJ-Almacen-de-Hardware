import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { VentasService } from '../../core/services/ventas';
import { Venta } from '../../core/models/venta';


@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ventas.html',
  styleUrls: ['./ventas.scss']
})
export class VentasComponent implements OnInit {

  ventas: Venta[] = [];
  ventaActual: Venta = this.valoresIniciales();
  modalVisible = false;
  modalEliminar = false;

  constructor(private ventasService: VentasService) {}

  ngOnInit(): void {
    this.listarVentas();
  }

  valoresIniciales(): Venta {
    const ahora = new Date();
    return {
      fecha: ahora.toISOString().slice(0, 16),
      estado: true,
      idUsuario: 0,
      idCliente: 0,
      idMovimiento: 0
    };
  }

  listarVentas(): void {
    this.ventasService.getVentas().subscribe({
      next: (data) => this.ventas = data,
      error: (err) => console.error("Error al listar ventas", err)
    });
  }

  abrirModalNuevo(): void {
    this.ventaActual = this.valoresIniciales();
    this.modalVisible = true;
  }

  abrirModalEditar(venta: Venta): void {
    this.ventaActual = { ...venta };
    this.modalVisible = true;
  }

  cerrarModal(): void {
    this.modalVisible = false;
  }

  abrirModalEliminar(venta: Venta): void {
    this.ventaActual = { ...venta };
    this.modalEliminar = true;
  }

  cerrarModalEliminar(): void {
    this.modalEliminar = false;
  }

  guardarVenta(): void {
    const ventaParaEnviar: Venta = {
      ...this.ventaActual,
      idUsuario: Number(this.ventaActual.idUsuario),
      idCliente: Number(this.ventaActual.idCliente),
      idMovimiento: Number(this.ventaActual.idMovimiento),
    };

    if (this.ventaActual.id) {
      this.ventasService.actualizarVenta(this.ventaActual.id, ventaParaEnviar).subscribe({
        next: () => {
          this.listarVentas();
          this.cerrarModal();
        },
        error: (err) => console.error("Error al actualizar", err)
      });
    } else {
      this.ventasService.registrarVenta(ventaParaEnviar).subscribe({
        next: () => {
          this.listarVentas();
          this.cerrarModal();
        },
        error: (err) => console.error("Error al registrar", err)
      });
    }
  }

 // 🔹 raro
  eliminarVenta(): void {
    if (!this.ventaActual.id) return;

    this.ventasService.eliminarVenta(this.ventaActual.id).subscribe({
      next: () => {
        this.listarVentas();
        this.cerrarModalEliminar();
      },
      error: (err) => console.error("Error al eliminar", err)
    });
  }
}
