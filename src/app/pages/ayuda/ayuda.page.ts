import { Component } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { CabeceraComponent } from '../../shared/components/cabecera/cabecera.component';

/** Manual de usuario integrado en la propia aplicación. */
@Component({
  selector: 'app-ayuda',
  templateUrl: './ayuda.page.html',
  imports: [IonContent, CabeceraComponent],
})
export class AyudaPage {}
