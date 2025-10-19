import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Almacen } from '../../core/models/almacen';
import { Almacenes } from '../../core/services/almacenes';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-almacenes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './almacenes.html',
  styleUrls: ['./almacenes.scss'],
})
export class AlmacenesComponent implements OnInit {
  almacenes: Almacen[] = [];
  almacenForm!: FormGroup;
  selectedAlmacen: Almacen | null = null;
  isEditMode = false;
  loading = false;

  showModal = false;
  showDeleteModal = false;

  constructor(private almacenesService: Almacenes, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
    this.loadAlmacenes();
  }

  private initForm(): void {
    this.almacenForm = this.fb.group({
      nombre: ['', Validators.required],
      direccion: [''],
      telefono: ['', [Validators.pattern(/^[0-9]{6,13}$/)]],
    });
  }

  get nombre() { return this.almacenForm.get('nombre'); }
  get telefono() { return this.almacenForm.get('telefono'); }

  loadAlmacenes(): void {
    this.almacenesService.getAlmacenes().subscribe({
      next: data => this.almacenes = data,
      error: err => console.error('Error al cargar almacenes:', err)
    });
  }

  private setForm(almacen?: Almacen) {
    this.almacenForm.reset();
    if (almacen) this.almacenForm.patchValue(almacen);
  }

  openCreateModal() {
    this.isEditMode = false;
    this.selectedAlmacen = null;
    this.setForm();
    this.showModal = true;
  }

  openEditModal(almacen: Almacen) {
    this.isEditMode = true;
    this.selectedAlmacen = { ...almacen };
    this.setForm(almacen);
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedAlmacen = null;
    this.almacenForm.reset();
  }

  saveAlmacen() {
    if (this.almacenForm.invalid) return;

    const obs: Observable<any> = this.isEditMode && this.selectedAlmacen?.id
      ? this.almacenesService.updateAlmacen(this.selectedAlmacen.id, this.almacenForm.value)
      : this.almacenesService.createAlmacen(this.almacenForm.value);

    this.runWithLoading(obs, () => {
      this.loadAlmacenes();
      this.closeModal();
    });
  }

  openDeleteModal(almacen: Almacen) {
    this.selectedAlmacen = almacen;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.selectedAlmacen = null;
  }

  deleteAlmacenConfirmed() {
    if (!this.selectedAlmacen) return;

    this.runWithLoading(
      this.almacenesService.deleteAlmacen(this.selectedAlmacen.id!),
      () => {
        this.loadAlmacenes();
        this.closeDeleteModal();
      }
    );
  }

  private runWithLoading(obs: Observable<any>, callback?: () => void) {
    this.loading = true;
    obs.subscribe({
      next: () => callback?.(),
      error: err => console.error(err),
      complete: () => this.loading = false
    });
  }
}
