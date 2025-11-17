import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router'; // <-- Asegúrate de que esto esté importado

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet], // <-- Y que esté aquí en los imports
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  title = 'admin-dashboard';
}