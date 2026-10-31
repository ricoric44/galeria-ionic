import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Producto, ResumenInventario } from '../models/modelos';

/** Acceso a la API REST relacional (SQL) del inventario. Todas las llamadas son asíncronas (Observables). */
@Injectable({ providedIn: 'root' })
export class ProductosService {
  private http = inject(HttpClient);

  public listar(): Observable<Producto[]> {
    return this.http.get<Producto[]>('/api/productos');
  }

  public crear(producto: Omit<Producto, 'id'>): Observable<Producto> {
    return this.http.post<Producto>('/api/productos', producto);
  }

  public borrar(id: number): Observable<null> {
    return this.http.delete<null>(`/api/productos/${id}`);
  }

  public resumen(): Observable<ResumenInventario> {
    return this.http.get<ResumenInventario>('/api/informes/resumen');
  }
}
