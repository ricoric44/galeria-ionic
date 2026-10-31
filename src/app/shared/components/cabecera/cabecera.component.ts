import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IonButtons, IonHeader, IonMenuButton, IonTitle, IonToolbar } from '@ionic/angular';

/** Cabecera común de las páginas: título (con su nivel de encabezado) y botón de menú. */
@Component({
  selector: 'app-cabecera',
  imports: [IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start"><ion-menu-button autoHide="true" aria-label="Abrir menú principal"></ion-menu-button></ion-buttons>
        <ion-title>{{ titulo() }}</ion-title>
      </ion-toolbar>
    </ion-header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CabeceraComponent {
  public titulo = input.required<string>();
}
