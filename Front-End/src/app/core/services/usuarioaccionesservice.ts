import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { UsuarioAcciones } from '../models/usuarioacciones';
import { environment } from '../../../environments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class UsuarioaccionesService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/usuarios`;

  /**
   * Obtener la línea de tiempo de acciones de un usuario
   * @param idUsuario ID del usuario
   * @param fechaDesde Fecha desde (opcional) formato: string($date-time)
   * @param fechaHasta Fecha hasta (opcional) formato: string($date-time)
   * @param idTipoAccion ID del tipo de acción para filtrar (opcional)
   * @returns Observable con las acciones del usuario
   */
  getLineaTiempo(
    idUsuario: number,
    fechaDesde?: string,
    fechaHasta?: string,
    idTipoAccion?: number
  ): Observable<UsuarioAcciones> {
    let params = new HttpParams();
    
    if (fechaDesde && fechaDesde.trim() !== '') {
      params = params.append('fechaDesde', fechaDesde.trim());
    }
    
    if (fechaHasta && fechaHasta.trim() !== '') {
      params = params.append('fechaHasta', fechaHasta.trim());
    }
    
    if (idTipoAccion !== undefined && idTipoAccion !== null) {
      params = params.append('idTipoAccion', idTipoAccion.toString());
    }

    const url = `${this.baseUrl}/${idUsuario}/linea-tiempo`;
    const fullUrl = params.toString() ? `${url}?${params.toString()}` : url;
    
    console.log('🔍 Llamando al endpoint de línea de tiempo:', url);
    console.log('📦 Parámetros:', params.toString());
    console.log('🌐 URL completa:', fullUrl);

    return this.http.get<UsuarioAcciones>(url, { params }).pipe(
      tap({
        next: (response) => console.log('✅ Respuesta HTTP recibida:', response),
        error: (error) => console.error('❌ Error HTTP:', error)
      })
    );
  }
}
