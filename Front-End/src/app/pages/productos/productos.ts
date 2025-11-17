import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Producto } from '../../core/models/producto';
import { Marca } from '../../core/models/marca';
import { ProductosService } from '../../core/services/producto';
import { MarcasService } from '../../core/services/marca';

interface FormField {
  label: string;
  control: string;
  type: string;
  placeholder?: string;
  errorMsg?: string;
}

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './productos.html',
})
export class ProductosComponent implements OnInit {
  productos: Producto[] = [];
  filteredProductos: Producto[] = [];
  marcas: Marca[] = [];

  productoForm!: FormGroup;
  selectedProducto: Producto | null = null;
  isEditMode = false;
  loading = false;

  showModal = false;
  showDeleteModal = false;
  showRestoreModal = false;
  showPermanentDeleteModal = false;

  searchTerm = '';

  currentPage = 1;
  itemsPerPage = 7;

  formFields: FormField[] = [];

  statusFilter: 'all' | 'active' | 'inactive' = 'all';

  constructor(
    private productosService: ProductosService,
    private marcasService: MarcasService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loadProductos();
    this.loadMarcas();
    this.initForm();
  }

  private initForm(): void {
    this.productoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      idMarca: [null, Validators.required],
      estado: [true],
    });

    this.formFields = [
      {
        label: 'Nombre',
        control: 'nombre',
        type: 'text',
        placeholder: 'Ingrese nombre',
        errorMsg: 'El nombre es obligatorio y debe tener al menos 3 caracteres.',
      },
      {
        label: 'Marca',
        control: 'idMarca',
        type: 'select',
        errorMsg: 'Debe seleccionar una marca.',
      },
    ];
  }

  loadProductos(): void {
    this.productosService.getProductos().subscribe({
      next: (data) => {
        this.productos = data;
        this.applyFilter();
      },
      error: (err) => console.error('Error al cargar productos:', err),
    });
  }

  loadMarcas(): void {
    this.marcasService.getMarcas().subscribe({
      next: (data) => (this.marcas = data.filter((m) => m.estado)),
      error: (err) => console.error('Error al cargar marcas:', err),
    });
  }

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredProductos = this.productos.filter((p) => {
      const matchesTerm =
        p.nombre.toLowerCase().includes(term) || p.idMarca.nombre.toLowerCase().includes(term);

      const matchesStatus =
        this.statusFilter === 'all' ||
        (this.statusFilter === 'active' && p.estado) ||
        (this.statusFilter === 'inactive' && !p.estado);

      return matchesTerm && matchesStatus;
    });
    this.currentPage = 1;
  }

  get paginatedProductos(): Producto[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredProductos.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number[] {
    return Array.from(
      { length: Math.ceil(this.filteredProductos.length / this.itemsPerPage) },
      (_, i) => i + 1
    );
  }

  changePage(page: number): void {
    this.currentPage = page;
  }

  openModal(producto?: Producto): void {
    if (producto) {
      this.isEditMode = true;
      this.selectedProducto = { ...producto };
      this.productoForm.patchValue(producto);
    } else {
      this.isEditMode = false;
      this.selectedProducto = null;
      this.productoForm.reset({ estado: true });
    }
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedProducto = null;
    this.productoForm.reset({ estado: true });
  }

  saveProducto(): void {
    if (this.productoForm.invalid) {
      this.productoForm.markAllAsTouched();
      return;
    }

    const productoData: Producto = this.productoForm.value;
    this.loading = true;

    const request$ =
      this.isEditMode && this.selectedProducto?.id
        ? this.productosService.updateProducto(this.selectedProducto.id, productoData)
        : this.productosService.createProducto(productoData);

    request$.subscribe({
      next: () => {
        this.loadProductos();
        this.closeModal();
      },
      error: (err) => console.error('Error al guardar producto:', err),
      complete: () => (this.loading = false),
    });
  }

  toggleModal(type: 'delete' | 'restore' | 'permanent', producto?: Producto): void {
    this.selectedProducto = producto ?? null;

    this.showDeleteModal = type === 'delete' && !!producto && producto.estado;
    this.showRestoreModal = type === 'restore' && !!producto && !producto.estado;
    this.showPermanentDeleteModal = type === 'permanent' && !!producto && !producto.estado;
  }

  deleteProductoConfirmed(): void {
    if (!this.selectedProducto) return;
    const actualizado = { ...this.selectedProducto, estado: false };
    this.productosService.updateProducto(actualizado.id!, actualizado).subscribe({
      next: () => {
        this.loadProductos();
        this.toggleModal('delete');
      },
      error: (err) => console.error('Error al inactivar producto:', err),
    });
  }

  restoreProductoConfirmed(): void {
    if (!this.selectedProducto) return;
    const actualizado = { ...this.selectedProducto, estado: true };
    this.productosService.updateProducto(actualizado.id!, actualizado).subscribe({
      next: () => {
        this.loadProductos();
        this.toggleModal('restore');
      },
      error: (err) => console.error('Error al restaurar producto:', err),
    });
  }

  deleteProductoPermanentConfirmed(): void {
    if (!this.selectedProducto) return;
    this.productosService.deleteProducto(this.selectedProducto.id!).subscribe({
      next: () => {
        this.loadProductos();
        this.toggleModal('permanent');
      },
      error: (err) => console.error('Error al eliminar producto:', err),
    });
  }

  compareMarcas(m1: Marca, m2: Marca): boolean {
    return m1 && m2 ? m1.id === m2.id : m1 === m2;
  }
}
