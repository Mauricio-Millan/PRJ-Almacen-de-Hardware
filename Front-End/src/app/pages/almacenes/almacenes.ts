import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Almacen } from '../../core/models/almacen';
import { Almacenes } from '../../core/services/almacenes';
import { AlmacendetalleService } from '../../core/services/almacendetalleservice';
import { AlmacenDetalle, ProductoDetalle } from '../../core/models/almacendetalle';

@Component({
  selector: 'app-almacenes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './almacenes.html',
  styleUrls: ['./almacenes.scss'],
})
export class AlmacenesComponent implements OnInit {
  almacenes: Almacen[] = [];
  filteredAlmacenes: Almacen[] = [];

  almacenForm!: FormGroup;
  selectedAlmacen: Almacen | null = null;
  isEditMode = false;
  loading = false;

  showModal = false;
  showDeleteModal = false;
  showDetalleModal = false;

  searchTerm = '';
  searchProducto = '';

  // 🔹 Detalle del almacén
  almacenDetalle: AlmacenDetalle | null = null;
  loadingDetalle = false;

  // 🔹 Paginación
  currentPage = 1;
  itemsPerPage = 7;

  constructor(
    private almacenesService: Almacenes, 
    private fb: FormBuilder,
    private almacenDetalleService: AlmacendetalleService
  ) {}

  ngOnInit(): void {
    this.loadAlmacenes();
    this.initForm();
  }

  /** Inicializa el formulario con validaciones */
  private initForm(): void {
    this.almacenForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      direccion: [''],
      telefono: [
        '',
        [
          Validators.pattern(/^\d*$/), // Solo números
          Validators.maxLength(9), // Máximo 9 dígitos
        ],
      ],
    });
  }

  /** Carga lista completa de almacenes */
  loadAlmacenes(): void {
    this.almacenesService.getAlmacenes().subscribe({
      next: (data) => {
        this.almacenes = data;
        this.applyFilter();
      },
      error: (err) => console.error('Error al cargar almacenes:', err),
    });
  }

  /** Filtro de búsqueda */
  applyFilter(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredAlmacenes = this.almacenes.filter(
      (a) =>
        a.nombre.toLowerCase().includes(term) ||
        (a.direccion && a.direccion.toLowerCase().includes(term)) ||
        (a.telefono && a.telefono.toLowerCase().includes(term))
    );
    this.currentPage = 1;
  }

  /** Paginación */
  get paginatedAlmacenes(): Almacen[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredAlmacenes.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number[] {
    return Array.from({ length: Math.ceil(this.filteredAlmacenes.length / this.itemsPerPage) }, (_, i) => i + 1);
  }

  changePage(page: number): void {
    this.currentPage = page;
  }

  /** Abrir modal de crear/editar */
  openModal(almacen?: Almacen): void {
    if (almacen) {
      this.isEditMode = true;
      this.selectedAlmacen = { ...almacen };
      this.almacenForm.patchValue(almacen);
    } else {
      this.isEditMode = false;
      this.selectedAlmacen = null;
      this.almacenForm.reset();
    }
    this.showModal = true;
  }

  /** Cerrar modal */
  closeModal(): void {
    this.showModal = false;
    this.selectedAlmacen = null;
    this.almacenForm.reset();
  }

  /** Crear o editar almacén */
  saveAlmacen(): void {
    if (this.almacenForm.invalid) {
      this.almacenForm.markAllAsTouched();
      return;
    }

    const almacenData: Almacen = this.almacenForm.value;
    this.loading = true;

    const request$ =
      this.isEditMode && this.selectedAlmacen?.id
        ? this.almacenesService.updateAlmacen(this.selectedAlmacen.id, almacenData)
        : this.almacenesService.createAlmacen(almacenData);

    request$.subscribe({
      next: () => {
        this.loadAlmacenes();
        this.closeModal();
      },
      error: (err) => console.error('Error al guardar almacén:', err),
      complete: () => (this.loading = false),
    });
  }

  /** Modales eliminar */
  toggleDeleteModal(almacen?: Almacen): void {
    this.selectedAlmacen = almacen ?? null;
    this.showDeleteModal = !!almacen;
  }

  /** Eliminar almacén directamente */
  deleteAlmacenConfirmed(): void {
    if (!this.selectedAlmacen) return;

    this.almacenesService.deleteAlmacen(this.selectedAlmacen.id!).subscribe({
      next: () => {
        this.loadAlmacenes();
        this.toggleDeleteModal();
      },
      error: (err) => console.error('Error al eliminar almacén:', err),
    });
  }

  /** Abrir modal de detalle del almacén */
  openDetalleModal(almacen: Almacen): void {
    this.selectedAlmacen = almacen;
    this.showDetalleModal = true;
    this.searchProducto = '';
    this.loadAlmacenDetalle(almacen.id!);
  }

  /** Cerrar modal de detalle */
  closeDetalleModal(): void {
    this.showDetalleModal = false;
    this.almacenDetalle = null;
    this.selectedAlmacen = null;
    this.searchProducto = '';
  }

  /** Cargar detalle del almacén */
  loadAlmacenDetalle(idAlmacen: number, producto?: string): void {
    console.log('📡 Iniciando carga de detalle...', { idAlmacen, producto });
    this.loadingDetalle = true;
    
    this.almacenDetalleService.getAlmacenDetalle(idAlmacen, producto).subscribe({
      next: (data) => {
        console.log('Respuesta recibida del backend:', data);
        console.log('Total productos recibidos:', data.productos?.length || 0);
        this.almacenDetalle = data;
        this.loadingDetalle = false;
      },
      error: (err) => {
        console.error(' Error al cargar detalle del almacén:', err);
        this.loadingDetalle = false;
      },
      complete: () => {
        console.log('Petición completada');
      }
    });
  }

  /** Filtrar productos en el detalle */
  filtrarProductos(): void {
    if (!this.selectedAlmacen?.id) {
      console.error('No hay almacén seleccionado');
      return;
    }

    const productoTexto = this.searchProducto?.trim() || '';
    
    console.log('Filtrando productos:', {
      idAlmacen: this.selectedAlmacen.id,
      textoBusqueda: productoTexto
    });
    
    // Si hay texto de búsqueda, pasarlo; si no, pasar undefined
    this.loadAlmacenDetalle(
      this.selectedAlmacen.id, 
      productoTexto !== '' ? productoTexto : undefined
    );
  }

  /** Limpiar filtro de productos */
  limpiarFiltro(): void {
    this.searchProducto = '';
    if (this.selectedAlmacen?.id) {
      this.loadAlmacenDetalle(this.selectedAlmacen.id);
    }
  }
}
