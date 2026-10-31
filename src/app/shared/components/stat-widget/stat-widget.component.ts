import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/**
 * Widget estadístico independiente: muestra una cifra con su etiqueta.
 * Recibe los datos por Inputs y emite `seleccionado` cuando el usuario lo pulsa (el padre decide qué hacer).
 */
@Component({
  selector: 'app-stat-widget',
  template: `
    <button type="button" class="widget" [class.alerta]="alerta()" (click)="seleccionado.emit(etiqueta())"
            [attr.aria-label]="etiqueta() + ': ' + valor() + (detalle() ? '. ' + detalle() : '')">
      <span class="etiqueta">{{ etiqueta() }}</span>
      <span class="valor">{{ valor() }}</span>
      @if (detalle()) {
        <span class="detalle">{{ detalle() }}</span>
      }
    </button>
  `,
  styles: `
    .widget {
      display: grid; gap: 4px; width: 100%; text-align: left; font: inherit; cursor: pointer; min-height: 44px;
      padding: 16px; border-radius: 12px; border: 1px solid #c3c8d0; background: #fff; color: #14233b;
    }
    .widget:hover { border-color: #1c4e80; }
    .widget:focus-visible { outline: 3px solid #0b57d0; outline-offset: 2px; }
    .widget.alerta { border-color: #9b1c1c; background: #fff4f4; }
    .etiqueta { font-size: 0.875rem; color: #3f4a5a; }
    .valor { font-size: 1.75rem; font-weight: 700; font-variant-numeric: tabular-nums; }
    .detalle { font-size: 0.8125rem; color: #3f4a5a; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatWidgetComponent {
  public etiqueta = input.required<string>();
  public valor = input.required<string | number | null>();
  public detalle = input('');
  public alerta = input(false);
  public seleccionado = output<string>();
}
