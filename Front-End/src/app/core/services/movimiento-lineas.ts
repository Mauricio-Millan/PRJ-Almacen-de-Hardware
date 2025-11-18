import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MovimientoLinea } from '../models/movimiento-linea';
import { environment } from '../../../environments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class MovimientoLineasService {
  private baseUrl = `${environment.apiUrl}/movimiento-lineas`;

  constructor(private http: HttpClient) {}

  getMovimientoLineas(): Observable<MovimientoLinea[]> {
    return this.http.get<MovimientoLinea[]>(this.baseUrl);
  }

  getMovimientoLineaById(id: number): Observable<MovimientoLinea> {
    return this.http.get<MovimientoLinea>(`${this.baseUrl}/${id}`);
  }

  createMovimientoLinea(movimientoLinea: MovimientoLinea): Observable<MovimientoLinea> {
    return this.http.post<MovimientoLinea>(this.baseUrl, movimientoLinea);
  }

  updateMovimientoLinea(id: number, movimientoLinea: MovimientoLinea): Observable<MovimientoLinea> {
    return this.http.put<MovimientoLinea>(`${this.baseUrl}/${id}`, movimientoLinea);
  }

  deleteMovimientoLinea(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  getMovimientoLineasByMovimiento(idMovimiento: number): Observable<MovimientoLinea[]> {
    return this.http.get<MovimientoLinea[]>(`${this.baseUrl}/movimiento/${idMovimiento}`);
  }
}
