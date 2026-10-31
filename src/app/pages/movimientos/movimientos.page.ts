import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IonContent } from '@ionic/angular';
import { Movimiento } from '../../core/models/modelos';
import { AuthService } from '../../core/services/auth.service';
import { MovimientosService } from '../../core/services/movimientos.service';
import { CabeceraComponent } from '../../shared/components/cabecera/cabecera.component';

/** Feed de movimientos de stock en tiempo real (colección NoSQL). Cualquier rol puede ver y registrar. */
@Component({
  selector: 'app-movimientos',
  templateUrl: './movimientos.page.html',
  imports: [IonContent, CabeceraComponent, DatePipe],
})
export class MovimientosPage {
  private servicio = inject(MovimientosService);
  private usuario = inject(AuthService).currentUser;

  protected movimientos = signal<Movimiento[]>([]);
  protected aviso = signal('');

  constructor() {
    // takeUntilDestroyed cancela la suscripción al salir de la página y evita fugas de memoria.
    this.servicio.escuchar().pipe(takeUntilDestroyed()).subscribe(docs => {
      const nuevos = docs.length - this.movimientos().length;
      this.movimientos.set(docs);
      if (nuevos > 0 && docs.length > 25) this.aviso.set(`Nuevo movimiento: ${docs[0].producto} (${docs[0].tipo}).`);
    });
  }

  protected registrar(tipo: 'entrada' | 'salida'): void {
    this.servicio.registrar({
      productoId: 1, producto: 'Teclado mecánico', tipo, cantidad: 1,
      usuario: this.usuario()?.nombre ?? 'Desconocido',
    });
    this.aviso.set(`Registrada ${tipo} de 1 unidad de Teclado mecánico.`);
  }
}
