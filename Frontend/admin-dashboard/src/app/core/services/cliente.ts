import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente } from '../models/cliente';
import { environment } from '../../../environments/enviroment';

@Injectable({
  providedIn: 'root',
})
export class ClientesService {
  private baseUrl = `${environment.apiUrl}/clientes`;

  constructor(private http: HttpClient) {}

  getClientes(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.baseUrl);
  }

  getClienteById(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.baseUrl}/${id}`);
  }

  getClienteByRuc(ruc: string): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.baseUrl}/ruc/${ruc}`);
  }

  createCliente(cliente: Cliente): Observable<Cliente> {
    return this.http.post<Cliente>(this.baseUrl, cliente);
  }

  updateCliente(id: number, cliente: Cliente): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.baseUrl}/${id}`, cliente);
  }

  deleteCliente(id: number): Observable<string> {
  return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' });
}

}
