import { Component } from '@angular/core';

@Component({
  selector: 'app-galeria',
  templateUrl: './galeria.component.html',
  styleUrls: ['./galeria.component.scss'],
  standalone: false,
})
export class GaleriaComponent {
  titulo: string = 'Galería de paisajes';
  rutaImagen: string = 'assets/imagenes/paisaje.svg';
}
