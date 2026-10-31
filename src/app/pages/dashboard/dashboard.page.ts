import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IonContent, IonSpinner } from '@ionic/angular';
import { forkJoin } from 'rxjs';
import { Movimiento, Producto } from '../../core/models/modelos';
import { ColumnaInforme, exportarCsv, exportarPdf } from '../../core/services/exportar.util';
import { MovimientosService } from '../../core/services/movimientos.service';
import { ProductosService } from '../../core/services/productos.service';
import { CabeceraComponent } from '../../shared/components/cabecera/cabecera.component';
import { GraficoComponent } from '../../shared/components/grafico/grafico.component';
import { StatWidgetComponent } from '../../shared/components/stat-widget/stat-widget.component';

const COLUMNAS_PRODUCTOS: ColumnaInforme<Producto>[] = [
  { titulo: 'Producto', valor: p => p.nombre },
  { titulo: 'Categoría', valor: p => p.categoria },
  { titulo: 'Precio (EUR)', valor: p => p.precio.toFixed(2) },
  { titulo: 'Stock', valor: p => p.stock },
  { titulo: 'Valor (EUR)', valor: p => (p.precio * p.stock).toFixed(2) },
];

/**
 * Cuadro de mando del administrador. Orquesta de forma concurrente la API SQL (productos)
 * y la colección NoSQL (movimientos) con `forkJoin`; después sigue escuchando los cambios en tiempo real.
 * Los filtros son señales: los gráficos y las cifras se recalculan al instante.
 */
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  imports: [IonContent, IonSpinner, CabeceraComponent, GraficoComponent, StatWidgetComponent, CurrencyPipe, DecimalPipe],
})
export class DashboardPage {
  private productosApi = inject(ProductosService);
  private movimientosApi = inject(MovimientosService);

  protected productos = signal<Producto[]>([]);
  protected movimientos = signal<Movimiento[]>([]);
  protected cargando = signal(true);
  protected error = signal('');
  protected aviso = signal('');

  protected categoria = signal('Todas');
  protected tipo = signal<'todos' | 'entrada' | 'salida'>('todos');

  protected categorias = computed(() => ['Todas', ...new Set(this.productos().map(p => p.categoria))]);
  protected productosFiltrados = computed(() =>
    this.productos().filter(p => this.categoria() === 'Todas' || p.categoria === this.categoria()));
  protected movimientosFiltrados = computed(() => {
    const idsValidos = new Set(this.productosFiltrados().map(p => p.id));
    return this.movimientos().filter(m => idsValidos.has(m.productoId) && (this.tipo() === 'todos' || m.tipo === this.tipo()));
  });

  protected stockPorCategoria = computed(() => {
    const mapa = new Map<string, number>();
    this.productosFiltrados().forEach(p => mapa.set(p.categoria, (mapa.get(p.categoria) ?? 0) + p.stock));
    return { etiquetas: [...mapa.keys()], valores: [...mapa.values()] };
  });
  protected movimientosPorTipo = computed(() => {
    const m = this.movimientosFiltrados();
    return {
      etiquetas: ['Entradas', 'Salidas'],
      valores: [m.filter(x => x.tipo === 'entrada').length, m.filter(x => x.tipo === 'salida').length],
    };
  });
  protected valorInventario = computed(() => this.productosFiltrados().reduce((s, p) => s + p.precio * p.stock, 0));
  protected unidades = computed(() => this.productosFiltrados().reduce((s, p) => s + p.stock, 0));
  protected sinStock = computed(() => this.productosFiltrados().filter(p => p.stock === 0).length);

  constructor() {
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set('');
    // Las dos fuentes se piden a la vez: el tiempo total es el de la más lenta, no la suma.
    forkJoin({ productos: this.productosApi.listar(), movimientos: this.movimientosApi.leerUnaVez() })
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: ({ productos, movimientos }) => {
          this.productos.set(productos);
          this.movimientos.set(movimientos);
          this.cargando.set(false);
          this.escucharTiempoReal();
        },
        error: () => { this.error.set('No se pudieron cargar los datos del cuadro de mando.'); this.cargando.set(false); },
      });
  }

  private escuchando = false;
  private escucharTiempoReal(): void {
    if (this.escuchando) return;
    this.escuchando = true;
    this.movimientosApi.escuchar().pipe(takeUntilDestroyed()).subscribe(docs => this.movimientos.set(docs));
  }

  protected filtrarCategoria(c: string): void {
    this.categoria.set(c);
  }

  protected elegirCategoriaDesdeGrafico(c: string): void {
    this.categoria.set(c);
    this.aviso.set(`Filtro aplicado desde el gráfico: ${c}.`);
  }

  protected descargarCsv(): void {
    exportarCsv('informe-inventario', COLUMNAS_PRODUCTOS, this.productosFiltrados());
    this.aviso.set('Informe CSV descargado.');
  }

  protected async descargarPdf(): Promise<void> {
    const filtro = this.categoria() === 'Todas' ? 'todas las categorías' : this.categoria();
    await exportarPdf('informe-inventario', 'Informe de inventario', COLUMNAS_PRODUCTOS, this.productosFiltrados(),
      `Categoría: ${filtro}.`);
    this.aviso.set('Informe PDF descargado.');
  }
}
