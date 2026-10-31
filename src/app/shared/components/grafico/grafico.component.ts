import {
  ArcElement, BarController, BarElement, CategoryScale, Chart, DoughnutController, Legend, LinearScale, Tooltip,
} from 'chart.js';
import {
  AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnChanges, OnDestroy, input, output, viewChild,
} from '@angular/core';

// Solo se registran los elementos que se usan (tree-shaking de Chart.js).
Chart.register(BarController, BarElement, DoughnutController, ArcElement, CategoryScale, LinearScale, Tooltip, Legend);

const PALETA = ['#1c4e80', '#b45309', '#2e7d32', '#7b3f98', '#a61e4d', '#00695c'];

/**
 * Gráfico reutilizable (barras o anillo) basado en Chart.js.
 * Inputs: `tipo`, `etiquetas`, `valores`, `titulo`. Output: `segmentoPulsado` con la etiqueta pulsada.
 * Libera el lienzo en `ngOnDestroy` para no dejar fugas de memoria. Incluye una tabla oculta como alternativa para lectores de pantalla.
 */
@Component({
  selector: 'app-grafico',
  template: `
    <figure>
      <figcaption>{{ titulo() }}</figcaption>
      <div class="lienzo">
        <canvas #lienzo role="img" [attr.aria-label]="descripcion()"></canvas>
      </div>
      <table class="solo-lectores">
        <caption>{{ titulo() }}</caption>
        <thead><tr><th scope="col">Categoría</th><th scope="col">Valor</th></tr></thead>
        <tbody>
          @for (e of etiquetas(); track e; let i = $index) {
            <tr><th scope="row">{{ e }}</th><td>{{ valores()[i] }}</td></tr>
          }
        </tbody>
      </table>
    </figure>
  `,
  styles: `
    figure { margin: 0; }
    figcaption { font-weight: 700; margin-bottom: 8px; }
    .lienzo { position: relative; height: 260px; }
    .solo-lectores { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraficoComponent implements AfterViewInit, OnChanges, OnDestroy {
  public tipo = input<'bar' | 'doughnut'>('bar');
  public titulo = input.required<string>();
  public etiquetas = input.required<string[]>();
  public valores = input.required<number[]>();
  public segmentoPulsado = output<string>();

  private lienzo = viewChild.required<ElementRef<HTMLCanvasElement>>('lienzo');
  private grafico: Chart | null = null;

  protected descripcion(): string {
    return `${this.titulo()}: ` + this.etiquetas().map((e, i) => `${e} ${this.valores()[i]}`).join(', ');
  }

  public ngAfterViewInit(): void {
    this.grafico = new Chart(this.lienzo().nativeElement, {
      type: this.tipo(),
      data: this.datos(),
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: this.tipo() === 'doughnut', position: 'bottom' } },
        onClick: (_e, elementos) => {
          if (elementos.length) this.segmentoPulsado.emit(this.etiquetas()[elementos[0].index]);
        },
      },
    });
  }

  public ngOnChanges(): void {
    if (!this.grafico) return;
    this.grafico.data = this.datos();
    this.grafico.update();
  }

  public ngOnDestroy(): void {
    this.grafico?.destroy();
    this.grafico = null;
  }

  private datos() {
    return {
      labels: this.etiquetas(),
      datasets: [{ label: this.titulo(), data: this.valores(), backgroundColor: PALETA, borderWidth: 0 }],
    };
  }
}
