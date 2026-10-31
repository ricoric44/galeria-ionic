import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import {
  IonApp, IonContent, IonHeader, IonItem, IonLabel, IonList, IonMenu, IonMenuToggle,
  IonRouterOutlet, IonSplitPane, IonTitle, IonToolbar,
} from '@ionic/angular';
import { AuthService } from './core/services/auth.service';
import { HasRoleDirective } from './core/directives/has-role.directive';

/** Elemento raíz: menú lateral (visible solo con sesión) y salida de rutas. */
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [
    RouterLink, RouterLinkActive, HasRoleDirective,
    IonApp, IonSplitPane, IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel,
    IonMenuToggle, IonRouterOutlet,
  ],
})
export class AppComponent {
  protected auth = inject(AuthService);
  private router = inject(Router);

  protected irAlContenido(): void {
    document.querySelector<HTMLElement>('.ion-page:not(.ion-page-hidden) #contenido-principal')?.focus();
  }

  protected cerrarSesion(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
