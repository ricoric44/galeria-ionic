import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';
import { ProductosService } from '../../core/services/productos.service';
import { ResumenInventario } from '../../core/models/modelos';
import { CabeceraComponent } from '../../shared/components/cabecera/cabecera.component';
import { StatWidgetComponent } from '../../shared/components/stat-widget/stat-widget.component';

/** Pantalla de bienvenida con los indicadores clave. El resumen solo se pide si el rol tiene permiso. */
@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  imports: [IonContent, CabeceraComponent, StatWidgetComponent, CurrencyPipe, DecimalPipe],
})
export class InicioPage {
  private router = inject(Router);
  protected sesion = inject(AuthService).currentUser;
  protected resumen = signal<ResumenInventario | null>(null);

  constructor() {
    if (inject(AuthService).hasPermiso('informes:ver')) {
      inject(ProductosService).resumen().subscribe(r => this.resumen.set(r));
    }
  }

  protected abrir(etiqueta: string): void {
    this.router.navigate([etiqueta.startsWith('Sin stock') ? '/productos' : '/dashboard']);
  }
}
