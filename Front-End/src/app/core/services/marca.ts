import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Marca } from '../models/marca';
import { environment } from '../../../environments/enviroment';

@Injectable({
  providedIn: 'root',
})
export class MarcasService {
  private baseUrl = `${environment.apiUrl}/marcas`;

  constructor(private http: HttpClient) {}

  getMarcas(): Observable<Marca[]> {
    return this.http.get<Marca[]>(this.baseUrl);
  }

  getMarcaById(id: number): Observable<Marca> {
    return this.http.get<Marca>(`${this.baseUrl}/${id}`);
  }

  getMarcaByNombre(nombre: string): Observable<Marca> {
    return this.http.get<Marca>(`${this.baseUrl}/nombre/${nombre}`);
  }

  createMarca(marca: Marca): Observable<Marca> {
    return this.http.post<Marca>(this.baseUrl, marca);
  }

  updateMarca(id: number, marca: Marca): Observable<Marca> {
    return this.http.put<Marca>(`${this.baseUrl}/${id}`, marca);
  }

  deleteMarca(id: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' });
  }

  getMarcasActivas(): Observable<Marca[]> {
  return this.http.get<Marca[]>(`${this.baseUrl}`).pipe(
    map(marcas => marcas.filter(m => m.estado)) // filtra solo las activas
  );
}

}
