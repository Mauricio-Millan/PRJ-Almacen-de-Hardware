import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Compra } from '../../core/models/compra';
import { ComprasService } from '../../core/services/compras';

@Component({
  selector: 'app-compras',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './compras.html',
  styleUrls: ['./compras.scss'],
})
export class ComprasComponent implements OnInit {
  compras: Compra[] = [];
  compraActual: Compra = {} as Compra;

  modalVisible = false;
  modalEditar = false;

  constructor(private comprasService: ComprasService) {}

  ngOnInit(): void {
    this.cargarCompras();
  }

  cargarCompras() {
    this.comprasService.getCompras().subscribe((data) => {
      this.compras = data;
    });
  }

  abrirModalNuevo() {
    this.compraActual = {
      idUsuario: 0,
      idProveedor: 0,
      idMovimiento: 0,
      fecha: ''
    };
    this.modalVisible = true;
  }


  abrirModalEditar(compra: Compra) {
    this.compraActual = {
      ...compra,
      idUsuario: compra.idUsuario, // es number
      idProveedor: compra.idProveedor, // es number
      idMovimiento: compra.idMovimiento // también number
    };

    this.modalEditar = true;
  }

  guardarCompra() {
    // Convierte el valor del input (que no tiene segundos ni Z)
    const fechaISO = new Date(this.compraActual.fecha!).toISOString();

    const compraParaEnviar: Compra = {
      fecha: fechaISO, // <-- ahora sí es válido para Instant
      estado: true,
      idUsuario: Number(this.compraActual.idUsuario),
      idProveedor: Number(this.compraActual.idProveedor),
      idMovimiento: Number(this.compraActual.idMovimiento)
    };

    if (this.compraActual.id) {
      this.comprasService.updateCompra(this.compraActual.id, compraParaEnviar)
        .subscribe(() => {
          this.cargarCompras();
          this.modalEditar = false;
        });
    } else {
      this.comprasService.createCompra(compraParaEnviar)
        .subscribe(() => {
          this.cargarCompras();
          this.modalVisible = false;
        });
    }
  }



  eliminarCompra(id: number) {
    this.compraAEliminar = { id } as Compra;
    this.showDeleteModalCompra = true;
  }

  cerrarModal() {
    this.modalVisible = false;
    this.modalEditar = false;
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
    if (!this.compraAEliminar) return;

    this.comprasService.deleteCompra(this.compraAEliminar.id!).subscribe({
      next: () => {
        this.cargarCompras();
        this.showDeleteModalCompra = false;
        this.compraAEliminar = null;
      },
      error: (err) =>
        console.error('Error eliminando compra:', err),
    });
  }
}
