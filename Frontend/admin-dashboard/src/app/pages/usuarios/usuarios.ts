import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Usuario } from '../../core/models/usuario';
import { UsuariosService } from '../../core/services/usuario';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './usuarios.html',
})
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  filteredUsuarios: Usuario[] = [];

  usuarioForm!: FormGroup;
  selectedUsuario: Usuario | null = null;
  isEditMode = false;
  loading = false;

  showModal = false;
  showDeleteModal = false;
  showRestoreModal = false;

  searchTerm = '';

  // Paginación
  currentPage = 1;
  itemsPerPage = 5;

  roles = [
    { id: 1, nombre: 'admin', estado: true },
    { id: 2, nombre: 'user', estado: true },
  ];

  constructor(private usuariosService: UsuariosService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.loadUsuarios();
    this.initForm();
  }

  private initForm(): void {
    this.usuarioForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      clave: ['', [Validators.required, Validators.minLength(4)]],
      fechaNacimiento: ['', Validators.required],
      idRol: [null, Validators.required],
      estado: [true],
    });
  }

  loadUsuarios(): void {
    this.usuariosService.getUsuarios().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.applyFilter();
      },
      error: (err) => console.error('Error al cargar usuarios:', err),
    });
  }

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredUsuarios = this.usuarios.filter(
      (u) =>
        u.nombre.toLowerCase().includes(term) ||
        u.dni.toLowerCase().includes(term) ||
        u.idRol.nombre.toLowerCase().includes(term)
    );
    this.currentPage = 1;
  }

  get paginatedUsuarios(): Usuario[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredUsuarios.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number[] {
    return Array.from({ length: Math.ceil(this.filteredUsuarios.length / this.itemsPerPage) }, (_, i) => i + 1);
  }

  changePage(page: number): void {
    this.currentPage = page;
  }

  openModal(usuario?: Usuario): void {
    if (usuario) {
      this.isEditMode = true;
      this.selectedUsuario = { ...usuario };
      this.usuarioForm.patchValue({
        nombre: usuario.nombre,
        dni: usuario.dni,
        clave: usuario.clave,
        fechaNacimiento: usuario.fechaNacimiento,
        idRol: usuario.idRol.id,
        estado: usuario.estado,
      });
    } else {
      this.isEditMode = false;
      this.selectedUsuario = null;
      this.usuarioForm.reset({ estado: true });
    }
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.usuarioForm.reset({ estado: true });
    this.selectedUsuario = null;
  }

  saveUsuario(): void {
    if (this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();
      return;
    }

    const formData = this.usuarioForm.value;
    const usuarioData: Usuario = {
      nombre: formData.nombre,
      dni: formData.dni,
      clave: formData.clave,
      fechaNacimiento: formData.fechaNacimiento,
      idRol: this.roles.find((r) => r.id === +formData.idRol)!,
      estado: formData.estado,
    };

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

  toggleDeleteModal(usuario?: Usuario): void {
    this.selectedUsuario = usuario ?? null;
    this.showDeleteModal = !!usuario;
  }

  toggleRestoreModal(usuario?: Usuario): void {
    this.selectedUsuario = usuario ?? null;
    this.showRestoreModal = !!usuario;
  }

  deleteUsuarioConfirmed(): void {
    if (!this.selectedUsuario) return;

    const actualizado = { ...this.selectedUsuario, estado: false };
    this.usuariosService.updateUsuario(actualizado.id!, actualizado).subscribe({
      next: () => {
        this.loadUsuarios();
        this.toggleDeleteModal();
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
        this.toggleRestoreModal();
      },
      error: (err) => console.error('Error al restaurar usuario:', err),
    });
  }
}
