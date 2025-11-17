import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common'; // <-- Importa CommonModule para usar *ngIf

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive], // <-- Añádelo a los imports
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss'
})
export class AdminLayoutComponent {
  isDropdownOpen = false; // Propiedad para controlar la visibilidad

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }
}