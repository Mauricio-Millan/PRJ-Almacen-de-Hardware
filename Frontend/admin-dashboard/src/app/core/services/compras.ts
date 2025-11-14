import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Compra } from '../models/compra';
import { environment } from '../../../environments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class ComprasService {
  private baseUrl = `${environment.apiUrl}/compras`;


  constructor(private http: HttpClient) {}

  getCompras(): Observable<Compra[]> {
    return this.http.get<Compra[]>(this.baseUrl);
  }

  createCompra(compra: Compra): Observable<Compra> {
    return this.http.post<Compra>(this.baseUrl, compra);
  }

  updateCompra(id: number, compra: Compra): Observable<Compra> {
    return this.http.put<Compra>(`${this.baseUrl}/${id}`, compra);
  }

  deleteCompra(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
