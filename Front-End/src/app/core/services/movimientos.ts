import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Movimiento } from '../models/movimiento';
import { MovimientoGenerarRequest, MovimientoGenerarResponse } from '../models/movimiento-generar-request';
import { environment } from '../../../environments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class MovimientosService {
  private baseUrl = `${environment.apiUrl}/movimientos`;

  constructor(private http: HttpClient) {}

  /**
   * Endpoint unificado para generar movimientos de cualquier tipo
   * Maneja ABASTECIMIENTO, TRANSFERENCIA, AJUSTE y VENTA en una sola llamada
   * @param request - Objeto con los datos del movimiento y sus líneas
   * @returns Observable con la respuesta del servidor
   */
  generarMovimiento(request: MovimientoGenerarRequest): Observable<MovimientoGenerarResponse> {
    return this.http.post<MovimientoGenerarResponse>(`${this.baseUrl}/generar`, request);
  }

  getMovimientos(): Observable<Movimiento[]> {
    return this.http.get<Movimiento[]>(this.baseUrl);
  }

  getMovimientoById(id: number): Observable<Movimiento> {
    return this.http.get<Movimiento>(`${this.baseUrl}/${id}`);
  }

  createMovimiento(movimiento: Movimiento): Observable<Movimiento> {
    return this.http.post<Movimiento>(this.baseUrl, movimiento);
  }

  updateMovimiento(id: number, movimiento: Movimiento): Observable<Movimiento> {
    return this.http.put<Movimiento>(`${this.baseUrl}/${id}`, movimiento);
  }

  deleteMovimiento(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
