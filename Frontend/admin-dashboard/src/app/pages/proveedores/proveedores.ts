import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Proveedor } from '../../core/models/proveedor';
import { Proveedores } from '../../core/services/proveedores';

@Component({
  selector: 'app-proveedores',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './proveedores.html',
  styleUrls: ['./proveedores.scss'],
})
export class ProveedoresComponent implements OnInit {
  proveedores: Proveedor[] = [];
  filteredProveedores: Proveedor[] = [];

  proveedorForm!: FormGroup;
  selectedProveedor: Proveedor | null = null;
  isEditMode = false;
  loading = false;

  showModal = false;
  showDeleteModal = false;
  showRestoreModal = false;

  searchTerm = '';

  // 🔹 Paginación
  currentPage = 1;
  itemsPerPage = 5;

  constructor(private proveedoresService: Proveedores, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.loadProveedores();
    this.initForm();
  }

  /** Inicializa el formulario con validaciones */
  private initForm(): void {
    this.proveedorForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      ruc: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d{11}$/), // Solo números y 11 dígitos exactos
        ],
      ],
      telefono: [
        '',
        [
          Validators.pattern(/^\d*$/), // Solo números
          Validators.maxLength(9), // Máximo 9 dígitos
        ],
      ],
      estado: [true],
    });
  }

  /** Carga lista completa de proveedores */
  loadProveedores(): void {
    this.proveedoresService.getProveedores().subscribe({
      next: (data) => {
        this.proveedores = data;
        this.applyFilter();
      },
      error: (err) => console.error('Error al cargar proveedores:', err),
    });
  }

  /** Filtro de búsqueda */
  applyFilter(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredProveedores = this.proveedores.filter(
      (p) =>
        p.nombre.toLowerCase().includes(term) ||
        p.ruc.toLowerCase().includes(term) ||
        (p.telefono && p.telefono.toLowerCase().includes(term))
    );
    this.currentPage = 1;
  }

  /** Paginación */
  get paginatedProveedores(): Proveedor[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredProveedores.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number[] {
    return Array.from({ length: Math.ceil(this.filteredProveedores.length / this.itemsPerPage) }, (_, i) => i + 1);
  }

  changePage(page: number): void {
    this.currentPage = page;
  }

  /** Abrir modal de crear/editar */
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

  /** Cerrar modal */
  closeModal(): void {
    this.showModal = false;
    this.selectedProveedor = null;
    this.proveedorForm.reset({ estado: true });
  }

  /** Crear o editar proveedor */
  saveProveedor(): void {
    if (this.proveedorForm.invalid) {
      this.proveedorForm.markAllAsTouched();
      return;
    }

    const proveedorData: Proveedor = this.proveedorForm.value;
    this.loading = true;

    const request$ =
      this.isEditMode && this.selectedProveedor?.id
        ? this.proveedoresService.updateProveedor(this.selectedProveedor.id, proveedorData)
        : this.proveedoresService.createProveedor(proveedorData);

    request$.subscribe({
      next: () => {
        this.loadProveedores();
        this.closeModal();
      },
      error: (err) => console.error('Error al guardar proveedor:', err),
      complete: () => (this.loading = false),
    });
  }

  /** Modales eliminar/restaurar */
  toggleDeleteModal(proveedor?: Proveedor): void {
    this.selectedProveedor = proveedor ?? null;
    this.showDeleteModal = !!proveedor;
  }

  toggleRestoreModal(proveedor?: Proveedor): void {
    this.selectedProveedor = proveedor ?? null;
    this.showRestoreModal = !!proveedor;
  }

  /** Cambiar estado (activo/inactivo) */
  deleteProveedorConfirmed(): void {
    if (!this.selectedProveedor) return;

    const actualizado = { ...this.selectedProveedor, estado: false };
    this.proveedoresService.updateProveedor(actualizado.id!, actualizado).subscribe({
      next: () => {
        this.loadProveedores();
        this.toggleDeleteModal();
      },
      error: (err) => console.error('Error al inactivar proveedor:', err),
    });
  }

  restoreProveedorConfirmed(): void {
    if (!this.selectedProveedor) return;

    const actualizado = { ...this.selectedProveedor, estado: true };
    this.proveedoresService.updateProveedor(actualizado.id!, actualizado).subscribe({
      next: () => {
        this.loadProveedores();
        this.toggleRestoreModal();
      },
      error: (err) => console.error('Error al restaurar proveedor:', err),
    });
  }
}
