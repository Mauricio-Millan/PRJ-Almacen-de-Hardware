import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { Cliente } from '../../core/models/cliente';
import { ClientesService } from '../../core/services/cliente';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './clientes.html',
})
export class ClientesComponent implements OnInit {
  clientes: Cliente[] = [];
  filteredClientes: Cliente[] = [];

  clienteForm!: FormGroup;
  selectedCliente: Cliente | null = null;
  isEditMode = false;
  loading = false;

  showModal = false;
  showDeleteModal = false;
  showRestoreModal = false;

  searchTerm = '';
  currentPage = 1;
  itemsPerPage = 7;

  statusFilter: 'all' | 'active' | 'inactive' = 'all';

  formFields = [
    {
      label: 'Nombre',
      control: 'nombre',
      type: 'text',
      placeholder: 'Ingrese nombre',
      errorMsg: 'El nombre es obligatorio y debe tener al menos 3 caracteres.',
    },
    {
      label: 'RUC',
      control: 'ruc',
      type: 'text',
      placeholder: 'Ingrese RUC',
      errorMsg: 'El RUC debe tener exactamente 11 dígitos numéricos.',
    },
    {
      label: 'Teléfono',
      control: 'telefono',
      type: 'text',
      placeholder: 'Ingrese teléfono',
      errorMsg: 'El teléfono es obligatorio y debe tener al menos 6 caracteres.',
    },
  ];

  constructor(private clientesService: ClientesService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.loadClientes();
    this.initForm();
  }

  private duplicateRucValidator(currentId: number | null = null): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const rucValue = control.value;
      const duplicate = this.clientes.some((c) => c.ruc === rucValue && c.id !== currentId);
      return duplicate ? { duplicate: true } : null;
    };
  }

  private duplicateNombreValidator(currentId: number | null = null): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const nombreValue = control.value?.trim().toLowerCase();
      if (!nombreValue) return null;
      const duplicate = this.clientes.some(
        (c) => c.nombre.trim().toLowerCase() === nombreValue && c.id !== currentId
      );
      return duplicate ? { duplicateName: true } : null;
    };
  }

  private initForm(): void {
    this.clienteForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3), this.duplicateNombreValidator()]],
      ruc: [
        '',
        [Validators.required, Validators.pattern(/^\d{11}$/), Validators.maxLength(11), this.duplicateRucValidator()],
      ],
      telefono: ['', [Validators.required, Validators.pattern(/^\d*$/), Validators.maxLength(9)]],
      estado: [true],
    });
  }

  loadClientes(): void {
    this.clientesService.getClientes().subscribe({
      next: (data) => {
        this.clientes = data;
        this.applyFilter();
      },
      error: (err) => console.error('Error al cargar clientes:', err),
    });
  }

  // applyFilter(): void {
  //   const term = this.searchTerm.toLowerCase();
  //   this.filteredClientes = this.clientes.filter(
  //     (c) => c.nombre.toLowerCase().includes(term) || c.ruc.toLowerCase().includes(term) || c.telefono.toLowerCase().includes(term)
  //   );
  //   this.currentPage = 1;
  // }

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredClientes = this.clientes.filter((c) => {
      const matchesTerm =
        c.nombre.toLowerCase().includes(term) ||
        c.ruc.toLowerCase().includes(term) ||
        c.telefono.toLowerCase().includes(term);

      const matchesStatus =
        this.statusFilter === 'all' ||
        (this.statusFilter === 'active' && c.estado) ||
        (this.statusFilter === 'inactive' && !c.estado);

      return matchesTerm && matchesStatus;
    });

    this.currentPage = 1;
  }

  get paginatedClientes(): Cliente[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredClientes.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number[] {
    return Array.from(
      { length: Math.ceil(this.filteredClientes.length / this.itemsPerPage) },
      (_, i) => i + 1
    );
  }

  changePage(page: number): void {
    this.currentPage = page;
  }

  openModal(cliente?: Cliente): void {
    if (cliente) {
      this.isEditMode = true;
      this.selectedCliente = { ...cliente };
      this.clienteForm.patchValue(cliente);
      this.clienteForm
        .get('nombre')
        ?.setValidators([
          Validators.required,
          Validators.minLength(3),
          this.duplicateNombreValidator(cliente.id),
        ]);
      this.clienteForm.get('nombre')?.updateValueAndValidity();
      this.clienteForm
        .get('ruc')
        ?.setValidators([
          Validators.required,
          Validators.pattern(/^\d{11}$/),
          Validators.maxLength(11),
          this.duplicateRucValidator(cliente.id),
        ]);
      this.clienteForm.get('ruc')?.updateValueAndValidity();
    } else {
      this.isEditMode = false;
      this.selectedCliente = null;
      this.clienteForm.reset({ estado: true });
      this.clienteForm
        .get('nombre')
        ?.setValidators([
          Validators.required,
          Validators.minLength(3),
          this.duplicateNombreValidator(),
        ]);
      this.clienteForm.get('nombre')?.updateValueAndValidity();
      this.clienteForm
        .get('ruc')
        ?.setValidators([
          Validators.required,
          Validators.pattern(/^\d{11}$/),
          Validators.maxLength(11),
          this.duplicateRucValidator(),
        ]);
      this.clienteForm.get('ruc')?.updateValueAndValidity();
    }
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedCliente = null;
    this.clienteForm.reset({ estado: true });
  }

  saveCliente(): void {
    if (
      this.clienteForm.invalid ||
      this.clienteForm.get('ruc')?.hasError('duplicate') ||
      this.clienteForm.get('nombre')?.hasError('duplicateName')
    ) {
      this.clienteForm.markAllAsTouched();
      return;
    }

    const clienteData: Cliente = this.clienteForm.value;
    this.loading = true;

    const request$ =
      this.isEditMode && this.selectedCliente?.id
        ? this.clientesService.updateCliente(this.selectedCliente.id, clienteData)
        : this.clientesService.createCliente(clienteData);

    request$.subscribe({
      next: () => {
        this.loadClientes();
        this.closeModal();
      },
      error: (err) => console.error('Error al guardar cliente:', err),
      complete: () => (this.loading = false),
    });
  }

  toggleModal(type: 'delete' | 'restore' | 'deletePermanent', cliente?: Cliente): void {
    this.selectedCliente = cliente ?? null;
    this.showDeleteModal = type === 'delete' && !!cliente;
    this.showRestoreModal = type === 'restore' && !!cliente;
    if (type === 'deletePermanent' && cliente) {
      this.showDeleteModal = true; // reutilizamos modal existente
    }
  }

  deleteClienteConfirmed(): void {
    if (!this.selectedCliente) return;
    const actualizado = { ...this.selectedCliente, estado: false };
    this.clientesService.updateCliente(actualizado.id!, actualizado).subscribe({
      next: () => {
        this.loadClientes();
        this.toggleModal('delete');
      },
      error: (err) => console.error('Error al inactivar cliente:', err),
    });
  }

  restoreClienteConfirmed(): void {
    if (!this.selectedCliente) return;
    const actualizado = { ...this.selectedCliente, estado: true };
    this.clientesService.updateCliente(actualizado.id!, actualizado).subscribe({
      next: () => {
        this.loadClientes();
        this.toggleModal('restore');
      },
      error: (err) => console.error('Error al restaurar cliente:', err),
    });
  }

  deleteClientePermanently(): void {
    if (!this.selectedCliente) return;
    this.clientesService.deleteCliente(this.selectedCliente.id!).subscribe({
      next: () => {
        this.clientes = this.clientes.filter((c) => c.id !== this.selectedCliente!.id);
        this.applyFilter();
        this.toggleModal('delete'); // cerrar modal
      },
      error: (err) => console.error('Error al eliminar cliente:', err),
    });
  }
}
