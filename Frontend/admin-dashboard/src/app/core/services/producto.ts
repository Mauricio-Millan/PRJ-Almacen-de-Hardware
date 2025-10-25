import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from '../models/producto';
import { environment } from '../../../environments/enviroment';

@Injectable({
  providedIn: 'root',
})
export class ProductosService {
  private baseUrl = `${environment.apiUrl}/productos`;

  constructor(private http: HttpClient) {}

  getProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.baseUrl);
  }

  getProductoById(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.baseUrl}/${id}`);
  }

  createProducto(producto: Producto): Observable<Producto> {
    return this.http.post<Producto>(this.baseUrl, producto);
  }

  updateProducto(id: number, producto: Producto): Observable<Producto> {
    return this.http.put<Producto>(`${this.baseUrl}/${id}`, producto);
  }

  deleteProducto(id: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' });
  }

  getProductosByMarca(marcaId: number): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.baseUrl}/marca/${marcaId}`);
  }

  getProductosByEstado(estado: boolean): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.baseUrl}/estado/${estado}`);
  }

  getProductosActivos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.baseUrl}/activos`);
  }

  getProductoByNombre(nombre: string): Observable<Producto> {
    return this.http.get<Producto>(`${this.baseUrl}/nombre/${nombre}`);
  }
}
