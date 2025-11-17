import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Almacen } from '../models/almacen';
import { environment } from '../../../environments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class Almacenes {
  private baseUrl = `${environment.apiUrl}/almacenes`;

  constructor(private http: HttpClient) {}

  // 📦 Obtener todos los almacenes
  getAlmacenes(): Observable<Almacen[]> {
    return this.http.get<Almacen[]>(this.baseUrl);
  }

  // 🔍 Obtener un almacén por ID
  getAlmacenById(id: number): Observable<Almacen> {
    return this.http.get<Almacen>(`${this.baseUrl}/${id}`);
  }

  // 🆕 Crear un nuevo almacén
  createAlmacen(almacen: Almacen): Observable<Almacen> {
    return this.http.post<Almacen>(this.baseUrl, almacen);
  }

  // ✏️ Actualizar un almacén existente
  updateAlmacen(id: number, almacen: Almacen): Observable<Almacen> {
    return this.http.put<Almacen>(`${this.baseUrl}/${id}`, almacen);
  }

  // ❌ Eliminar un almacén (respuesta en texto para evitar error de parsing)
  deleteAlmacen(id: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' });
  }
}
