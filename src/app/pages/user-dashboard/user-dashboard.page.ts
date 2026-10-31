import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle,
  IonCardContent, IonButtons, IonButton
} from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';
import { HasRoleDirective } from '../../core/directives/has-role.directive';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.page.html',
  styleUrls: ['./user-dashboard.page.scss'],
  standalone: true,
  imports: [
    CommonModule, HasRoleDirective,
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle,
    IonCardContent, IonButtons, IonButton
  ]
})
export class UserDashboardPage {
  private authService = inject(AuthService);
  private router = inject(Router);
  private http = inject(HttpClient);

  public currentSession = this.authService.currentUser;
  public registro = signal<string[]>([]);

  public handleLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  public ir(ruta: string): void {
    this.router.navigate([ruta]);
  }

  public consultar(endpoint: string): void {
    this.http.get(endpoint).subscribe({
      next: () => this.anotar(`GET ${endpoint} -> 200 OK`),
      error: e => this.anotar(`GET ${endpoint} -> ${e.status ?? 'error'}`),
    });
  }

  public caducarToken(): void {
    this.authService.caducarAccessToken();
    this.anotar('Token de acceso caducado a propósito (exp en el pasado)');
  }

  private anotar(linea: string): void {
    this.registro.update(r => [...r, linea]);
  }
}
