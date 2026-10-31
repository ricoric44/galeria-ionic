import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

/** Definición de una columna: clave del dato, cabecera y alineación. */
export interface ColumnaTabla {
  clave: string;
  titulo: string;
  numerica?: boolean;
}

/**
 * Tabla de datos avanzada y agnóstica: no sabe de dónde vienen las filas.
 * Recibe `columnas` y `filas` por Inputs y avisa al padre con Outputs (`filaSeleccionada`, `accion`, `busquedaCambiada`).
 * Incluye buscador (two-way binding), ordenación por columna y paginación.
 */
@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
})
export class DataTableComponent {
  public titulo = input.required<string>();
  public columnas = input.required<ColumnaTabla[]>();
  public filas = input.required<Record<string, string | number>[]>();
  public tamanoPagina = input(6);
  /** Si se indica, se añade una columna con un botón por fila que emite `accion`. */
  public etiquetaAccion = input<string | null>(null);

  public filaSeleccionada = output<Record<string, string | number>>();
  public accion = output<Record<string, string | number>>();
  public busquedaCambiada = output<string>();

  public busqueda = signal('');
  protected pagina = signal(0);
  protected orden = signal<{ clave: string; asc: boolean } | null>(null);

  protected filtradas = computed(() => {
    const q = this.busqueda().trim().toLowerCase();
    let filas = this.filas();
    if (q) filas = filas.filter(f => Object.values(f).some(v => String(v).toLowerCase().includes(q)));
    const o = this.orden();
    if (o) {
      filas = [...filas].sort((a, b) => {
        const x = a[o.clave], y = b[o.clave];
        const r = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), 'es');
        return o.asc ? r : -r;
      });
    }
    return filas;
  });

  protected totalPaginas = computed(() => Math.max(1, Math.ceil(this.filtradas().length / this.tamanoPagina())));
  protected visibles = computed(() => {
    const p = Math.min(this.pagina(), this.totalPaginas() - 1);
    return this.filtradas().slice(p * this.tamanoPagina(), (p + 1) * this.tamanoPagina());
  });
  protected paginaActual = computed(() => Math.min(this.pagina(), this.totalPaginas() - 1));

  protected ariaOrden(clave: string): 'ascending' | 'descending' | 'none' {
    const o = this.orden();
    return o?.clave === clave ? (o.asc ? 'ascending' : 'descending') : 'none';
  }

  protected ordenarPor(clave: string): void {
    const o = this.orden();
    this.orden.set(o?.clave === clave ? { clave, asc: !o.asc } : { clave, asc: true });
  }

  protected buscar(texto: string): void {
    this.busqueda.set(texto);
    this.pagina.set(0);
    this.busquedaCambiada.emit(texto);
  }

  protected cambiarPagina(delta: number): void {
    this.pagina.set(Math.min(Math.max(this.paginaActual() + delta, 0), this.totalPaginas() - 1));
  }
}
