import { Component } from '@angular/core';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';

/** Galería de la actividad anterior: ejemplo de interpolación y property binding. */
@Component({
  selector: 'app-galeria',
  templateUrl: './galeria.component.html',
  styleUrls: ['./galeria.component.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent],
})
export class GaleriaComponent {
  titulo = 'Galería de paisajes';
  rutaImagen = 'assets/imagenes/paisaje.svg';
}
