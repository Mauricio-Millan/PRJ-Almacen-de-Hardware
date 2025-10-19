import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Proveedor } from '../../core/models/proveedor';
import { Proveedores } from '../../core/services/proveedores';

@Component({
  selector: 'app-proveedores',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './proveedores.html',
  styleUrls: ['./proveedores.scss'],
})
export class ProveedoresComponent implements OnInit {
  proveedores: Proveedor[] = [];
  proveedorForm!: FormGroup;
  selectedProveedor: Proveedor | null = null;
  isEditMode = false;
  loading = false;

  showModal = false;
  showDeleteModal = false;

  constructor(private proveedoresService: Proveedores, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.loadProveedores();
    this.initForm();
  }

  /** Inicializa el formulario */
  private initForm(): void {
    this.proveedorForm = this.fb.group({
      nombre: ['', Validators.required],
      ruc: ['', Validators.required],
      telefono: [''],
      estado: [true],
    });
  }

  /** Carga la lista de proveedores */
  loadProveedores(): void {
    this.proveedoresService.getProveedores().subscribe({
      next: (data) => (this.proveedores = data),
      error: (err) => console.error('Error al cargar proveedores:', err),
    });
  }

  /** Abre modal de creación o edición */
  openModal(proveedor?: Proveedor): void {
    if (proveedor) {
      this.isEditMode = true;
      this.selectedProveedor = { ...proveedor };
      this.proveedorForm.patchValue(proveedor);
    } else {
      this.isEditMode = false;
      this.selectedProveedor = null;
      this.proveedorForm.reset({ estado: true });
    }
    this.showModal = true;
  }

  /** Cierra modal de creación/edición */
  closeModal(): void {
    this.showModal = false;
    this.selectedProveedor = null;
    this.proveedorForm.reset({ estado: true });
  }

  /** Guarda o actualiza un proveedor */
  saveProveedor(): void {
    if (this.proveedorForm.invalid) return;

    const payload: Proveedor = this.proveedorForm.value;
    this.loading = true;

    const request$ = this.isEditMode && this.selectedProveedor?.id
      ? this.proveedoresService.updateProveedor(this.selectedProveedor.id, payload)
      : this.proveedoresService.createProveedor(payload);

    request$.subscribe({
      next: () => {
        this.loadProveedores();
        this.closeModal();
      },
      error: (err) => console.error('Error al guardar proveedor:', err),
      complete: () => (this.loading = false),
    });
  }

  /** Abre/cierra modal de eliminación */
  toggleDeleteModal(proveedor?: Proveedor): void {
    this.selectedProveedor = proveedor ?? null;
    this.showDeleteModal = !!proveedor;
  }

  /** Confirma eliminación */
  deleteProveedorConfirmed(): void {
    if (!this.selectedProveedor) return;

    this.loading = true;
    this.proveedoresService.deleteProveedor(this.selectedProveedor.id!).subscribe({
      next: () => {
        this.loadProveedores();
        this.toggleDeleteModal(); // Cierra modal
      },
      error: (err) => console.error('Error al eliminar:', err),
      complete: () => (this.loading = false),
    });
  }
}
