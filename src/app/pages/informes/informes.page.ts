import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle,
  IonCardContent, IonButtons, IonButton
} from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-informes',
  templateUrl: './informes.page.html',
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle,
    IonCardContent, IonButtons, IonButton
  ]
})
export class InformesPage {
  private router = inject(Router);
  public currentSession = inject(AuthService).currentUser;

  public volver(): void {
    this.router.navigate(['/user-dashboard']);
  }
}
