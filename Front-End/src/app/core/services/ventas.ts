import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Venta } from '../models/venta';
import { environment } from '../../../environments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class VentasService {

  private baseUrl = `${environment.apiUrl}/productos`;

  constructor(private http: HttpClient) {}

  getVentas(): Observable<Venta[]> {
    return this.http.get<Venta[]>(`${this.baseUrl}`);
  }

  registrarVenta(venta: Venta): Observable<any> {
    return this.http.post(`${this.baseUrl}`, venta);
  }

  actualizarVenta(id: number, venta: Venta): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, venta);
  }

  eliminarVenta(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
