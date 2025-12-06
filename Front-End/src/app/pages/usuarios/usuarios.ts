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
import { UsuarioaccionesService } from '../../core/services/usuarioaccionesservice';
import { UsuarioAcciones } from '../../core/models/usuarioacciones';
import { AuthService } from '../../core/services/auth.service';

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
  private readonly restrictedRoleId = 2;
  private isRestrictedUserView = false;
  private currentUserId: number | null = null;

  usuarioForm!: FormGroup;
  selectedUsuario: Usuario | null = null;
  isEditMode = false;
  loading = false;

  showModal = false;
  showDeleteModal = false;
  showRestoreModal = false;
  showPermanentDeleteModal = false;
  showLineaTiempoModal = false;

  searchTerm = '';
  estadoFiltro: 'todos' | 'activos' | 'inactivos' = 'todos';
  currentPage = 1;
  itemsPerPage = 7;

  // 🔹 Línea de tiempo
  usuarioAcciones: UsuarioAcciones | null = null;
  loadingLineaTiempo = false;
  filtroFechaDesde = '';
  filtroFechaHasta = '';
  filtroTipoAccion: number | null = null;

  constructor(
    private usuariosService: UsuariosService,
    private rolesService: RolesService,
    private fb: FormBuilder,
    private usuarioAccionesService: UsuarioaccionesService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId();
    this.isRestrictedUserView = this.authService.getCurrentUserRoleId() === this.restrictedRoleId;
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

    if (this.isRestrictedUserView && this.currentUserId !== null) {
      this.filteredUsuarios = this.filteredUsuarios.filter((u) => u.id === this.currentUserId);
    }

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

  // === Línea de Tiempo ===
  
  /** Abrir modal de línea de tiempo */
  openLineaTiempoModal(usuario: Usuario): void {
    this.selectedUsuario = usuario;
    this.showLineaTiempoModal = true;
    
    // Configurar fecha por defecto: 30 días antes a las 00:00
    const fechaHoy = new Date();
    const fecha30DiasAntes = new Date();
    fecha30DiasAntes.setDate(fechaHoy.getDate() - 30);
    fecha30DiasAntes.setHours(0, 0, 0, 0);
    
    // Fecha hasta: hoy a las 23:59
    fechaHoy.setHours(23, 59, 59, 999);
    
    // Formatear fechas para los inputs (YYYY-MM-DD HH:mm)
    this.filtroFechaDesde = this.formatDateTimeForInput(fecha30DiasAntes);
    this.filtroFechaHasta = this.formatDateTimeForInput(fechaHoy);
    this.filtroTipoAccion = null;
    
    // Cargar con las fechas por defecto
    this.loadLineaTiempo(usuario.id!, this.filtroFechaDesde, this.filtroFechaHasta);
  }
  
  /** Formatear fecha para input datetime-local (formato: YYYY-MM-DDTHH:mm) */
  private formatDateTimeForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  /** Cerrar modal de línea de tiempo */
  closeLineaTiempoModal(): void {
    this.showLineaTiempoModal = false;
    this.usuarioAcciones = null;
    this.selectedUsuario = null;
    this.filtroFechaDesde = '';
    this.filtroFechaHasta = '';
    this.filtroTipoAccion = null;
  }

  /** Cargar línea de tiempo del usuario */
  loadLineaTiempo(idUsuario: number, fechaDesde?: string, fechaHasta?: string, idTipoAccion?: number): void {
    console.log('📡 Iniciando carga de línea de tiempo...', { idUsuario, fechaDesde, fechaHasta, idTipoAccion });
    this.loadingLineaTiempo = true;
    
    this.usuarioAccionesService.getLineaTiempo(idUsuario, fechaDesde, fechaHasta, idTipoAccion).subscribe({
      next: (data) => {
        console.log('✅ Respuesta recibida del backend:', data);
        console.log('📊 Total acciones recibidas:', data.lineaTiempo?.length || 0);
        this.usuarioAcciones = data;
        this.loadingLineaTiempo = false;
      },
      error: (err) => {
        console.error('❌ Error al cargar línea de tiempo:', err);
        this.loadingLineaTiempo = false;
      },
      complete: () => {
        console.log('🏁 Petición completada');
      }
    });
  }

  /** Aplicar filtros de línea de tiempo */
  aplicarFiltros(): void {
    if (!this.selectedUsuario?.id) {
      console.error('❌ No hay usuario seleccionado');
      return;
    }

    console.log('🔍 Aplicando filtros:', {
      idUsuario: this.selectedUsuario.id,
      fechaDesde: this.filtroFechaDesde,
      fechaHasta: this.filtroFechaHasta,
      idTipoAccion: this.filtroTipoAccion
    });
    
    this.loadLineaTiempo(
      this.selectedUsuario.id,
      this.filtroFechaDesde || undefined,
      this.filtroFechaHasta || undefined,
      this.filtroTipoAccion !== null ? this.filtroTipoAccion : undefined
    );
  }

  /** Limpiar filtros de línea de tiempo */
  limpiarFiltrosLineaTiempo(): void {
    console.log('🧹 Limpiando filtros y restaurando valores por defecto...');
    
    // Restaurar fechas por defecto: 30 días antes a las 00:00
    const fechaHoy = new Date();
    const fecha30DiasAntes = new Date();
    fecha30DiasAntes.setDate(fechaHoy.getDate() - 30);
    fecha30DiasAntes.setHours(0, 0, 0, 0);
    
    // Fecha hasta: hoy a las 23:59
    fechaHoy.setHours(23, 59, 59, 999);
    
    this.filtroFechaDesde = this.formatDateTimeForInput(fecha30DiasAntes);
    this.filtroFechaHasta = this.formatDateTimeForInput(fechaHoy);
    this.filtroTipoAccion = null;
    
    if (this.selectedUsuario?.id) {
      console.log('📥 Recargando acciones con fechas por defecto:', this.selectedUsuario.id);
      this.loadLineaTiempo(this.selectedUsuario.id, this.filtroFechaDesde, this.filtroFechaHasta);
    }
  }

  /** Obtener color según tipo de flujo */
  getTipoFlujoColor(tipoFlujo: string): string {
    const colores: { [key: string]: string } = {
      'Entrada': 'bg-green-100 text-green-800',
      'Salida': 'bg-red-100 text-red-800',
      'Traslado': 'bg-blue-100 text-blue-800',
      'Ajuste': 'bg-yellow-100 text-yellow-800'
    };
    return colores[tipoFlujo] || 'bg-gray-100 text-gray-800';
  }
}
