import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Almacen } from '../../core/models/almacen';
import { Almacenes } from '../../core/services/almacenes';
import { AlmacendetalleService } from '../../core/services/almacendetalleservice';
import { AlmacenDetalle, ProductoDetalle } from '../../core/models/almacendetalle';

interface DireccionFormFields {
  departamento: string;
  ciudad: string;
  distrito: string;
  direccionDetalle: string;
}

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
  showRestoreModal = false;
  showPermanentDeleteModal = false;

  searchTerm = '';
  searchProducto = '';

  // 🔹 Detalle del almacén
  almacenDetalle: AlmacenDetalle | null = null;
  loadingDetalle = false;

  // 🔹 Paginación
  currentPage = 1;
  itemsPerPage = 7;

  filterStatus: 'all' | 'active' | 'inactive' = 'all';

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
      departamento: ['', Validators.required],
      ciudad: ['', Validators.required],
      distrito: ['', Validators.required],
      direccionDetalle: ['', [Validators.required, Validators.minLength(5)]],
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

    this.filteredAlmacenes = this.almacenes.filter((a) => {
      const matchesSearch =
        a.nombre.toLowerCase().includes(term) ||
        (a.telefono && a.telefono.toLowerCase().includes(term)) ||
        (a.direccion && a.direccion.toLowerCase().includes(term));

      const matchesStatus =
        this.filterStatus === 'all' ||
        (this.filterStatus === 'active' && a.estado) ||
        (this.filterStatus === 'inactive' && !a.estado);

      return matchesSearch && matchesStatus;
    });

    this.currentPage = 1;
  }

  /** Paginación */
  get paginatedAlmacenes(): Almacen[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredAlmacenes.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number[] {
    return Array.from(
      { length: Math.ceil(this.filteredAlmacenes.length / this.itemsPerPage) },
      (_, i) => i + 1
    );
  }

  changePage(page: number): void {
    this.currentPage = page;
  }

  /** Abrir modal de crear/editar */
  openModal(almacen?: Almacen): void {
    if (almacen) {
      this.isEditMode = true;
      this.selectedAlmacen = { ...almacen };
      const direccionParts = this.parseDireccion(almacen.direccion);
      this.almacenForm.patchValue({
        nombre: almacen.nombre,
        telefono: almacen.telefono || '',
        estado: almacen.estado,
        ...direccionParts,
      });
    } else {
      this.isEditMode = false;
      this.selectedAlmacen = null;
      this.almacenForm.reset({
        nombre: '',
        telefono: '',
        estado: true,
        ...this.getDireccionDefaults(),
      });
    }
    this.showModal = true;
  }

  /** Cerrar modal */
  closeModal(): void {
    this.showModal = false;
    this.selectedAlmacen = null;
    this.almacenForm.reset({
      nombre: '',
      telefono: '',
      estado: true,
      ...this.getDireccionDefaults(),
    });
  }

  /** Crear o editar almacén */
  saveAlmacen(): void {
    if (this.almacenForm.invalid) {
      this.almacenForm.markAllAsTouched();
      return;
    }

    const formValue = this.almacenForm.value;
    const direccion = this.composeDireccion({
      departamento: formValue.departamento,
      ciudad: formValue.ciudad,
      distrito: formValue.distrito,
      direccionDetalle: formValue.direccionDetalle,
    });

    const nombre = (formValue.nombre ?? '').trim();

    const almacenData: Almacen = {
      nombre,
      direccion,
      estado: formValue.estado,
    };

    if (formValue.telefono?.trim()) {
      almacenData.telefono = formValue.telefono.trim();
    }
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
  toggleModal(type: 'delete' | 'restore' | 'permanent', almacen?: Almacen): void {
    this.selectedAlmacen = almacen ?? null;
    this.showDeleteModal = type === 'delete' && !!almacen && almacen.estado;
    this.showRestoreModal = type === 'restore' && !!almacen && !almacen.estado;
    this.showPermanentDeleteModal = type === 'permanent' && !!almacen && !almacen.estado;
  }

  /** Eliminar almacén directamente */
  deleteAlmacenConfirmed(): void {
    if (!this.selectedAlmacen) return;

    const actualizado = { ...this.selectedAlmacen, estado: false };

    this.almacenesService.updateAlmacen(actualizado.id!, actualizado).subscribe({
      next: () => {
        this.loadAlmacenes();
        this.toggleModal('delete');
      },
      error: (err) => console.error('Error al inactivar almacén:', err),
    });
  }

  restoreAlmacenConfirmed(): void {
    if (!this.selectedAlmacen) return;

    const actualizado = { ...this.selectedAlmacen, estado: true };

    this.almacenesService.updateAlmacen(actualizado.id!, actualizado).subscribe({
      next: () => {
        this.loadAlmacenes();
        this.toggleModal('restore');
      },
      error: (err) => console.error('Error al restaurar almacén:', err),
    });
  }

  deleteAlmacenPermanentConfirmed(): void {
    if (!this.selectedAlmacen) return;

    this.almacenesService.deleteAlmacen(this.selectedAlmacen.id!).subscribe({
      next: () => {
        this.loadAlmacenes();
        this.toggleModal('permanent');
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
      },
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
      textoBusqueda: productoTexto,
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

  private getDireccionDefaults(): DireccionFormFields {
    return {
      departamento: '',
      ciudad: '',
      distrito: '',
      direccionDetalle: '',
    };
  }

  private normalizeLabel(label?: string): string {
    return label
      ? label
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .trim()
      : '';
  }

  private parseDireccion(direccion?: string): DireccionFormFields {
    const result = this.getDireccionDefaults();
    if (!direccion) {
      return result;
    }

    const segments = direccion
      .split('|')
      .map((segment) => segment.trim())
      .filter(Boolean);

    segments.forEach((segment) => {
      const [label, ...valueParts] = segment.split(':');
      const value = valueParts.join(':').trim();
      const normalizedLabel = this.normalizeLabel(label);

      if (normalizedLabel.includes('departamento')) {
        result.departamento = value;
      } else if (normalizedLabel.includes('ciudad')) {
        result.ciudad = value;
      } else if (normalizedLabel.includes('distrito')) {
        result.distrito = value;
      } else if (normalizedLabel.includes('direccion')) {
        result.direccionDetalle = value;
      }
    });

    if (!result.direccionDetalle) {
      result.direccionDetalle = direccion.trim();
    }

    return result;
  }

  private composeDireccion(fields: DireccionFormFields): string {
    const { departamento, ciudad, distrito, direccionDetalle } = fields;
    const segments = [
      departamento?.trim() ? `Departamento: ${departamento.trim()}` : '',
      ciudad?.trim() ? `Ciudad: ${ciudad.trim()}` : '',
      distrito?.trim() ? `Distrito: ${distrito.trim()}` : '',
      direccionDetalle?.trim() ? `Direccion: ${direccionDetalle.trim()}` : '',
    ].filter(Boolean);

    return segments.join(' | ').trim();
  }
}
