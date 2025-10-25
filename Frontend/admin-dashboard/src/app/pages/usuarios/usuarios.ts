import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Usuario } from '../../core/models/usuario';
import { UsuariosService } from '../../core/services/usuario';
import { Rol } from '../../core/models/rol';
import { RolesService } from '../../core/services/rol';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './usuarios.html',
  styleUrls: ['./usuarios.scss'],
})
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  filteredUsuarios: Usuario[] = [];
  roles: Rol[] = [];

  usuarioForm!: FormGroup;
  selectedUsuario: Usuario | null = null;
  isEditMode = false;
  loading = false;

  showModal = false;
  showDeleteModal = false;
  showRestoreModal = false;
  showPermanentDeleteModal = false;

  searchTerm = '';
  estadoFiltro: 'todos' | 'activos' | 'inactivos' = 'todos';
  currentPage = 1;
  itemsPerPage = 7;

  constructor(
    private usuariosService: UsuariosService,
    private rolesService: RolesService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loadUsuarios();
    this.loadRoles();
    this.initForm();
  }

  private initForm(): void {
    this.usuarioForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      dni: [
        '',
        [Validators.required, Validators.pattern(/^\d{8}$/), this.duplicateDniValidator.bind(this)],
      ],
      clave: ['', [Validators.required, Validators.minLength(4)]],
      fechaNacimiento: [''],
      idRol: [null, Validators.required],
      estado: [true],
    });
  }

  // === Validación personalizada para evitar DNI duplicados ===
  duplicateDniValidator(control: AbstractControl) {
    if (!control.value) return null;

    const dniExistente = this.usuarios.some(
      (u) => u.dni === control.value && u.id !== this.selectedUsuario?.id
    );
    return dniExistente ? { duplicate: true } : null;
  }

  // === Carga de usuarios y roles ===
  loadUsuarios(): void {
    this.usuariosService.getUsuarios().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.applyFilter();
      },
      error: (err) => console.error('Error al cargar usuarios:', err),
    });
  }

  loadRoles(): void {
    this.rolesService.getRolesActivos().subscribe({
      next: (data) => (this.roles = data),
      error: (err) => console.error('Error al cargar roles:', err),
    });
  }

  // === Filtros por búsqueda y estado ===
  applyFilter(): void {
    const term = this.searchTerm.toLowerCase();

    this.filteredUsuarios = this.usuarios.filter((u) => {
      const coincideBusqueda =
        u.nombre.toLowerCase().includes(term) ||
        u.dni.includes(term) ||
        u.idRol.nombre.toLowerCase().includes(term);

      const coincideEstado =
        this.estadoFiltro === 'todos' ||
        (this.estadoFiltro === 'activos' && u.estado) ||
        (this.estadoFiltro === 'inactivos' && !u.estado);

      return coincideBusqueda && coincideEstado;
    });

    this.currentPage = 1;
  }

  // === Paginación ===
  get paginatedUsuarios(): Usuario[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredUsuarios.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number[] {
    return Array.from(
      { length: Math.ceil(this.filteredUsuarios.length / this.itemsPerPage) },
      (_, i) => i + 1
    );
  }

  changePage(page: number): void {
    this.currentPage = page;
  }

  // === CRUD ===
  openModal(usuario?: Usuario): void {
    if (usuario) {
      this.isEditMode = true;
      this.selectedUsuario = { ...usuario };
      this.usuarioForm.patchValue(usuario);
    } else {
      this.isEditMode = false;
      this.selectedUsuario = null;
      this.usuarioForm.reset({ estado: true });
    }
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedUsuario = null;
    this.usuarioForm.reset({ estado: true });
  }

  saveUsuario(): void {
    // Marca todos los campos como tocados
    this.usuarioForm.markAllAsTouched();

    // No guarda si el formulario es inválido o el DNI está repetido
    if (this.usuarioForm.invalid || this.usuarioForm.get('dni')?.hasError('duplicate')) {
      console.warn('No se puede guardar: formulario inválido o DNI duplicado.');
      return;
    }

    const usuarioData: Usuario = this.usuarioForm.value;
    this.loading = true;

    const request$ =
      this.isEditMode && this.selectedUsuario?.id
        ? this.usuariosService.updateUsuario(this.selectedUsuario.id, usuarioData)
        : this.usuariosService.createUsuario(usuarioData);

    request$.subscribe({
      next: () => {
        this.loadUsuarios();
        this.closeModal();
      },
      error: (err) => console.error('Error al guardar usuario:', err),
      complete: () => (this.loading = false),
    });
  }

  // === Modales de confirmación ===
  toggleModal(type: 'delete' | 'restore' | 'permanent', usuario?: Usuario): void {
    this.selectedUsuario = usuario ?? null;
    this.showDeleteModal = type === 'delete' && !!usuario && usuario.estado;
    this.showRestoreModal = type === 'restore' && !!usuario && !usuario.estado;
    this.showPermanentDeleteModal = type === 'permanent' && !!usuario && !usuario.estado;
  }

  // === Cambiar estado / eliminar ===
  deleteUsuarioConfirmed(): void {
    if (!this.selectedUsuario) return;

    const actualizado = { ...this.selectedUsuario, estado: false };
    this.usuariosService.updateUsuario(actualizado.id!, actualizado).subscribe({
      next: () => {
        this.loadUsuarios();
        this.toggleModal('delete');
      },
      error: (err) => console.error('Error al inactivar usuario:', err),
    });
  }

  restoreUsuarioConfirmed(): void {
    if (!this.selectedUsuario) return;

    const actualizado = { ...this.selectedUsuario, estado: true };
    this.usuariosService.updateUsuario(actualizado.id!, actualizado).subscribe({
      next: () => {
        this.loadUsuarios();
        this.toggleModal('restore');
      },
      error: (err) => console.error('Error al restaurar usuario:', err),
    });
  }

  deleteUsuarioPermanentConfirmed(): void {
    if (!this.selectedUsuario) return;

    this.usuariosService.deleteUsuario(this.selectedUsuario.id!).subscribe({
      next: () => {
        this.loadUsuarios();
        this.toggleModal('permanent');
      },
      error: (err) => console.error('Error al eliminar usuario:', err),
    });
  }

  // === Comparador de roles ===
  compareRoles(r1: Rol, r2: Rol): boolean {
    return r1?.id === r2?.id;
  }
}
