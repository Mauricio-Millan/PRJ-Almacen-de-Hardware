import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
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
  showPermanentDeleteModal = false;

  searchTerm = '';
  currentPage = 1;
  itemsPerPage = 7;

  filterStatus: 'all' | 'active' | 'inactive' = 'all';

  constructor(private proveedoresService: Proveedores, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.loadProveedores();
    this.initForm();
  }

  private duplicateRucValidator(currentId: number | null = null): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const rucValue = control.value;
      const duplicate = this.proveedores.some((p) => p.ruc === rucValue && p.id !== currentId);
      return duplicate ? { duplicate: true } : null;
    };
  }

  private duplicateNombreValidator(currentId: number | null = null): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const nombreValue = control.value?.trim().toLowerCase();
      if (!nombreValue) return null;
      const duplicate = this.proveedores.some(
        (p) => p.nombre.trim().toLowerCase() === nombreValue && p.id !== currentId
      );
      return duplicate ? { duplicateName: true } : null;
    };
  }

  private initForm(): void {
    this.proveedorForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3), this.duplicateNombreValidator()]],
      ruc: [
        '',
        [Validators.required, Validators.pattern(/^\d{11}$/), this.duplicateRucValidator()],
      ],
      telefono: ['', [Validators.pattern(/^\d*$/), Validators.maxLength(9)]],
      estado: [true],
    });
  }

  loadProveedores(): void {
    this.proveedoresService.getProveedores().subscribe({
      next: (data) => {
        this.proveedores = data;
        this.applyFilter();
      },
      error: (err) => console.error('Error al cargar proveedores:', err),
    });
  }

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase();

    this.filteredProveedores = this.proveedores.filter((p) => {
      const matchesSearch =
        p.nombre.toLowerCase().includes(term) ||
        p.ruc.toLowerCase().includes(term) ||
        (p.telefono && p.telefono.toLowerCase().includes(term));

      const matchesStatus =
        this.filterStatus === 'all' ||
        (this.filterStatus === 'active' && p.estado) ||
        (this.filterStatus === 'inactive' && !p.estado);

      return matchesSearch && matchesStatus;
    });

    this.currentPage = 1;
  }

  get paginatedProveedores(): Proveedor[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredProveedores.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number[] {
    return Array.from(
      { length: Math.ceil(this.filteredProveedores.length / this.itemsPerPage) },
      (_, i) => i + 1
    );
  }

  changePage(page: number): void {
    this.currentPage = page;
  }

  openModal(proveedor?: Proveedor): void {
    if (proveedor) {
      this.isEditMode = true;
      this.selectedProveedor = { ...proveedor };
      this.proveedorForm.patchValue(proveedor);
      // actualizar validators para ignorar el propio RUC y nombre
      this.proveedorForm
        .get('nombre')
        ?.setValidators([
          Validators.required,
          Validators.minLength(3),
          this.duplicateNombreValidator(proveedor.id),
        ]);
      this.proveedorForm.get('nombre')?.updateValueAndValidity();
      this.proveedorForm
        .get('ruc')
        ?.setValidators([
          Validators.required,
          Validators.pattern(/^\d{11}$/),
          this.duplicateRucValidator(proveedor.id),
        ]);
      this.proveedorForm.get('ruc')?.updateValueAndValidity();
    } else {
      this.isEditMode = false;
      this.selectedProveedor = null;
      this.proveedorForm.reset({ estado: true });
      this.proveedorForm
        .get('nombre')
        ?.setValidators([
          Validators.required,
          Validators.minLength(3),
          this.duplicateNombreValidator(),
        ]);
      this.proveedorForm.get('nombre')?.updateValueAndValidity();
      this.proveedorForm
        .get('ruc')
        ?.setValidators([
          Validators.required,
          Validators.pattern(/^\d{11}$/),
          this.duplicateRucValidator(),
        ]);
      this.proveedorForm.get('ruc')?.updateValueAndValidity();
    }
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedProveedor = null;
    this.proveedorForm.reset({ estado: true });
  }

  saveProveedor(): void {
    if (
      this.proveedorForm.invalid ||
      this.proveedorForm.get('ruc')?.hasError('duplicate') ||
      this.proveedorForm.get('nombre')?.hasError('duplicateName')
    ) {
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

  toggleModal(type: 'delete' | 'restore' | 'permanent', proveedor?: Proveedor): void {
    this.selectedProveedor = proveedor ?? null;
    this.showDeleteModal = type === 'delete' && !!proveedor && proveedor.estado;
    this.showRestoreModal = type === 'restore' && !!proveedor && !proveedor.estado;
    this.showPermanentDeleteModal = type === 'permanent' && !!proveedor && !proveedor.estado;
  }

  deleteProveedorConfirmed(): void {
    if (!this.selectedProveedor) return;
    const actualizado = { ...this.selectedProveedor, estado: false };
    this.proveedoresService.updateProveedor(actualizado.id!, actualizado).subscribe({
      next: () => {
        this.loadProveedores();
        this.toggleModal('delete');
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
        this.toggleModal('restore');
      },
      error: (err) => console.error('Error al restaurar proveedor:', err),
    });
  }

  deleteProveedorPermanentConfirmed(): void {
    if (!this.selectedProveedor) return;
    this.proveedoresService.deleteProveedor(this.selectedProveedor.id!).subscribe({
      next: () => {
        this.loadProveedores();
        this.toggleModal('permanent');
      },
      error: (err) => console.error('Error al eliminar proveedor:', err),
    });
  }
}
