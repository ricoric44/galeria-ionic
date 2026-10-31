import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { Movimiento } from '../models/modelos';

const ORIGEN_SINTETICO = ['Almacén A', 'Almacén B', 'Tienda web', 'Tienda centro'];
const PRODUCTOS_BASE: Array<[number, string]> = [
  [1, 'Teclado mecánico'], [2, 'Ratón inalámbrico'], [3, 'Monitor 24 pulgadas'],
  [7, 'Cable HDMI 2 m'], [8, 'Hub USB-C'], [11, 'SSD externo 1 TB'],
];

/**
 * Almacén de documentos en tiempo real (equivalente a una colección de Firestore, NoSQL).
 * `escuchar()` imita `onSnapshot`: emite la colección completa al suscribirse y de nuevo con cada cambio.
 * Los cambios llegan de otros "clientes" simulados mientras haya alguien suscrito.
 */
@Injectable({ providedIn: 'root' })
export class MovimientosService {
  private documentos: Movimiento[] = this.semilla();
  private oyentes = new Set<(docs: Movimiento[]) => void>();
  private temporizador: ReturnType<typeof setInterval> | null = null;
  private contador = this.documentos.length;

  /** Emite la colección actual y cada actualización posterior. Al cancelar la suscripción se limpia todo. */
  public escuchar(): Observable<Movimiento[]> {
    return new Observable<Movimiento[]>(suscriptor => {
      const oyente = (docs: Movimiento[]) => suscriptor.next(docs);
      this.oyentes.add(oyente);
      this.arrancar();
      oyente(this.copia());
      return () => {
        this.oyentes.delete(oyente);
        if (this.oyentes.size === 0) this.parar();
      };
    });
  }

  /** Lectura puntual con latencia (para orquestarla junto a la API SQL con `forkJoin`). */
  public leerUnaVez(): Observable<Movimiento[]> {
    return of(this.copia()).pipe(delay(700));
  }

  /** Añade un documento (equivalente a `addDoc`) y avisa a todos los oyentes. */
  public registrar(dato: Omit<Movimiento, 'id' | 'fecha'>): void {
    this.documentos = [{ ...dato, id: `mov-${++this.contador}`, fecha: new Date().toISOString() }, ...this.documentos];
    this.notificar();
  }

  private arrancar(): void {
    if (this.temporizador) return;
    this.temporizador = setInterval(() => {
      const [productoId, producto] = PRODUCTOS_BASE[Math.floor(Math.random() * PRODUCTOS_BASE.length)];
      this.registrar({
        productoId, producto,
        tipo: Math.random() > 0.45 ? 'salida' : 'entrada',
        cantidad: 1 + Math.floor(Math.random() * 12),
        usuario: ORIGEN_SINTETICO[Math.floor(Math.random() * ORIGEN_SINTETICO.length)],
      });
    }, 9000);
  }

  private parar(): void {
    if (this.temporizador) clearInterval(this.temporizador);
    this.temporizador = null;
  }

  private notificar(): void {
    const docs = this.copia();
    this.oyentes.forEach(o => o(docs));
  }

  private copia(): Movimiento[] {
    return this.documentos.map(d => ({ ...d }));
  }

  private semilla(): Movimiento[] {
    const base = Date.UTC(2026, 9, 1, 9, 0, 0);
    return Array.from({ length: 24 }, (_, i) => {
      const [productoId, producto] = PRODUCTOS_BASE[i % PRODUCTOS_BASE.length];
      return {
        id: `mov-${24 - i}`, productoId, producto,
        tipo: i % 3 === 0 ? 'entrada' : 'salida',
        cantidad: 2 + ((i * 7) % 11),
        fecha: new Date(base + (24 - i) * 86_400_000 / 2).toISOString(),
        usuario: ORIGEN_SINTETICO[i % ORIGEN_SINTETICO.length],
      } as Movimiento;
    });
  }
}
