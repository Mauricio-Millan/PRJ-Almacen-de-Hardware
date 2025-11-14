import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Venta } from '../models/venta';

@Injectable({
  providedIn: 'root'
})
export class VentasService {

  private url = 'http://localhost:8080/ventas';

  constructor(private http: HttpClient) {}

  getVentas(): Observable<Venta[]> {
    return this.http.get<Venta[]>(`${this.url}/listar`);
  }

  registrarVenta(venta: Venta): Observable<any> {
    return this.http.post(`${this.url}/registrar`, venta);
  }

  actualizarVenta(id: number, venta: Venta): Observable<any> {
    return this.http.put(`${this.url}/actualizar/${id}`, venta);
  }

  eliminarVenta(id: number): Observable<any> {
    return this.http.delete(`${this.url}/eliminar/${id}`);
  }
}
