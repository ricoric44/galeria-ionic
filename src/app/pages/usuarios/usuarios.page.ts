import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { IonContent, IonSpinner } from '@ionic/angular';
import { UsuarioPublico } from '../../core/models/modelos';
import { CabeceraComponent } from '../../shared/components/cabecera/cabecera.component';
import { ColumnaTabla, DataTableComponent } from '../../shared/components/data-table/data-table.component';

/** Listado de usuarios, exclusivo del administrador (guard de rol + permiso `usuarios:gestionar` en la API). */
@Component({
  selector: 'app-usuarios',
  template: `
    <app-cabecera titulo="Usuarios" />
    <ion-content>
      <main id="contenido-principal" tabindex="-1" class="caja ancha">
        <h1>Usuarios</h1>
        @if (cargando()) {
          <p role="status" class="cargando"><ion-spinner name="crescent" aria-hidden="true"></ion-spinner> Cargando usuarios…</p>
        } @else {
          <app-data-table titulo="Usuarios" [columnas]="columnas" [filas]="filas()" [tamanoPagina]="5" />
        }
      </main>
    </ion-content>
  `,
  imports: [IonContent, IonSpinner, CabeceraComponent, DataTableComponent],
})
export class UsuariosPage {
  protected columnas: ColumnaTabla[] = [
    { clave: 'nombre', titulo: 'Nombre' },
    { clave: 'email', titulo: 'Correo' },
    { clave: 'rolTexto', titulo: 'Rol' },
  ];
  protected usuarios = signal<UsuarioPublico[]>([]);
  protected filas = computed(() =>
    this.usuarios().map(u => ({ ...u, rolTexto: u.rol === 'admin' ? 'Administrador' : 'Usuario estándar' })));
  protected cargando = signal(true);

  constructor() {
    inject(HttpClient).get<UsuarioPublico[]>('/api/usuarios').subscribe({
      next: u => { this.usuarios.set(u); this.cargando.set(false); },
      error: () => this.cargando.set(false),
    });
  }
}
