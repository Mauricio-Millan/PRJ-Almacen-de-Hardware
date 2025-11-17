import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Rol } from '../models/rol';
import { environment } from '../../../environments/enviroment';


@Injectable({
  providedIn: 'root',
})
export class RolesService {
  private baseUrl = `${environment.apiUrl}/roles`;

  constructor(private http: HttpClient) {}

  getRoles(): Observable<Rol[]> {
    return this.http.get<Rol[]>(this.baseUrl);
  }

  getRolById(id: number): Observable<Rol> {
    return this.http.get<Rol>(`${this.baseUrl}/${id}`);
  }

  createRol(rol: Rol): Observable<Rol> {
    return this.http.post<Rol>(this.baseUrl, rol);
  }

  updateRol(id: number, rol: Rol): Observable<Rol> {
    return this.http.put<Rol>(`${this.baseUrl}/${id}`, rol);
  }

  deleteRol(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getRolesActivos(): Observable<Rol[]> {
    return this.http.get<Rol[]>(`${this.baseUrl}/activos`);
  }
}
