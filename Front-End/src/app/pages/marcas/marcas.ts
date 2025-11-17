import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Marca } from '../../core/models/marca';
import { MarcasService } from '../../core/services/marca';

@Component({
  selector: 'app-marcas',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './marcas.html',
})
export class MarcasComponent implements OnInit {
  marcas: Marca[] = [];
  filteredMarcas: Marca[] = [];
  marcaForm!: FormGroup;
  selectedMarca: Marca | null = null;
  isEditMode = false;
  loading = false;

  showModal = false;
  showDeleteModal = false;
  showRestoreModal = false;
  showPermanentDeleteModal = false;

  searchTerm = '';
  currentPage = 1;
  itemsPerPage = 7;
  statusFilter: 'all' | 'active' | 'inactive' = 'all';

  constructor(private marcasService: MarcasService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
    this.refresh();
  }

  private initForm(): void {
    this.marcaForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      estado: [true],
    });
  }

  private refresh(): void {
    this.marcasService.getMarcas().subscribe({
      next: (data) => {
        this.marcas = data;
        this.applyFilter();
      },
      error: (err) => console.error('Error al cargar marcas:', err),
    });
  }

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase();

    this.filteredMarcas = this.marcas.filter((m) => {
      const matchesTerm = m.nombre.toLowerCase().includes(term);
      const matchesStatus =
        this.statusFilter === 'all' ||
        (this.statusFilter === 'active' && m.estado) ||
        (this.statusFilter === 'inactive' && !m.estado);
      return matchesTerm && matchesStatus;
    });

    this.currentPage = 1;
  }

  get paginatedMarcas(): Marca[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredMarcas.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number[] {
    return Array.from(
      { length: Math.ceil(this.filteredMarcas.length / this.itemsPerPage) },
      (_, i) => i + 1
    );
  }

  changePage(page: number): void {
    this.currentPage = page;
  }

  openModal(marca?: Marca): void {
    if (marca) {
      this.isEditMode = true;
      this.selectedMarca = { ...marca };
      this.marcaForm.patchValue(marca);
    } else {
      this.isEditMode = false;
      this.selectedMarca = null;
      this.marcaForm.reset({ estado: true });
    }
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedMarca = null;
    this.marcaForm.reset({ estado: true });
  }

  saveMarca(): void {
    if (this.marcaForm.invalid) {
      this.marcaForm.markAllAsTouched();
      return;
    }

    const data: Marca = this.marcaForm.value;
    this.loading = true;

    const request$ =
      this.isEditMode && this.selectedMarca?.id
        ? this.marcasService.updateMarca(this.selectedMarca.id, data)
        : this.marcasService.createMarca(data);

    request$.subscribe({
      next: () => {
        this.refresh();
        this.closeModal();
      },
      error: (err) => console.error('Error al guardar marca:', err),
      complete: () => (this.loading = false),
    });
  }

  toggleModal(type: 'delete' | 'restore' | 'permanent', marca?: Marca): void {
    this.selectedMarca = marca ?? null;
    this.showDeleteModal = type === 'delete' && !!marca;
    this.showRestoreModal = type === 'restore' && !!marca;
    this.showPermanentDeleteModal = type === 'permanent' && !!marca;
  }

  /** Inactivar marca */
  deleteMarcaConfirmed(): void {
    if (!this.selectedMarca) return;
    const actualizado = { ...this.selectedMarca, estado: false };
    this.marcasService.updateMarca(actualizado.id!, actualizado).subscribe({
      next: () => this.refresh(),
      error: (err) => console.error(err),
    });
    this.toggleModal('delete');
  }

  /** Restaurar marca */
  restoreMarcaConfirmed(): void {
    if (!this.selectedMarca) return;
    const actualizado = { ...this.selectedMarca, estado: true };
    this.marcasService.updateMarca(actualizado.id!, actualizado).subscribe({
      next: () => this.refresh(),
      error: (err) => console.error(err),
    });
    this.toggleModal('restore');
  }

  /** Eliminar marca permanentemente */
  deleteMarcaPermanentConfirmed(): void {
    if (!this.selectedMarca) return;
    this.marcasService.deleteMarca(this.selectedMarca.id!).subscribe({
      next: () => this.refresh(),
      error: (err) => console.error(err),
    });
    this.toggleModal('permanent');
  }
}
