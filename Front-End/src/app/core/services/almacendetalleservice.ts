import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AlmacenDetalle } from '../models/almacendetalle';
import { environment } from '../../../environments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class AlmacendetalleService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/almacenes`;

  /**
   * Obtener el detalle de un almacén por ID
   * @param idAlmacen ID del almacén
   * @param nombreProducto Nombre del producto para filtrar (opcional)
   * @returns Observable con el detalle del almacén
   */
  getAlmacenDetalle(idAlmacen: number, nombreProducto?: string): Observable<AlmacenDetalle> {
    let params = new HttpParams();
    
    // Solo agregar el parámetro 'nombreProducto' si tiene valor
    if (nombreProducto && nombreProducto.trim() !== '') {
      params = params.append('nombreProducto', nombreProducto.trim());
    }

    const url = `${this.baseUrl}/${idAlmacen}/detalle`;
    const fullUrl = params.toString() ? `${url}?${params.toString()}` : url;
    
    console.log('🔍 Llamando al endpoint:', url);
    console.log('📦 Parámetros:', params.toString());
    console.log('🌐 URL completa:', fullUrl);

    return this.http.get<AlmacenDetalle>(url, { params }).pipe(
      tap({
        next: (response) => console.log('✅ Respuesta HTTP recibida:', response),
        error: (error) => console.error('❌ Error HTTP:', error)
      })
    );
  }
}
