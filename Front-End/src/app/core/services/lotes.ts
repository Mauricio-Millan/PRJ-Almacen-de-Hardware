import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Lote } from '../models/lote';
import { environment } from '../../../environments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class LotesService {
  private baseUrl = `${environment.apiUrl}/lotes`;

  constructor(private http: HttpClient) {}

  getLotes(): Observable<Lote[]> {
    return this.http.get<Lote[]>(this.baseUrl);
  }

  getLoteById(id: number): Observable<Lote> {
    return this.http.get<Lote>(`${this.baseUrl}/${id}`);
  }

  createLote(lote: Lote): Observable<Lote> {
    return this.http.post<Lote>(this.baseUrl, lote);
  }

  updateLote(id: number, lote: Lote): Observable<Lote> {
    return this.http.put<Lote>(`${this.baseUrl}/${id}`, lote);
  }

  deleteLote(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
