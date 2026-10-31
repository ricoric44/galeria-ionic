import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonContent, IonSpinner } from '@ionic/angular';
import { Producto } from '../../core/models/modelos';
import { AuthService } from '../../core/services/auth.service';
import { ProductosService } from '../../core/services/productos.service';
import { CabeceraComponent } from '../../shared/components/cabecera/cabecera.component';
import { ColumnaTabla, DataTableComponent } from '../../shared/components/data-table/data-table.component';

/** Listado de productos (API SQL). El administrador puede dar de alta y eliminar; el usuario estándar solo consulta. */
@Component({
  selector: 'app-productos',
  templateUrl: './productos.page.html',
  imports: [ReactiveFormsModule, IonContent, IonSpinner, CabeceraComponent, DataTableComponent, CurrencyPipe],
})
export class ProductosPage {
  private api = inject(ProductosService);
  protected puedeEditar = inject(AuthService).hasPermiso('productos:editar');

  protected columnas: ColumnaTabla[] = [
    { clave: 'nombre', titulo: 'Producto' },
    { clave: 'categoria', titulo: 'Categoría' },
    { clave: 'precio', titulo: 'Precio (€)', numerica: true },
    { clave: 'stock', titulo: 'Stock', numerica: true },
  ];
  protected productos = signal<Producto[]>([]);
  protected filas = computed(() => this.productos() as unknown as Record<string, string | number>[]);
  protected cargando = signal(true);
  protected error = signal('');
  protected aviso = signal('');
  protected seleccionado = signal<Producto | null>(null);

  protected form = inject(FormBuilder).nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    categoria: ['Accesorios', Validators.required],
    precio: [0, [Validators.required, Validators.min(0.01)]],
    stock: [0, [Validators.required, Validators.min(0)]],
  });

  constructor() {
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set('');
    this.api.listar().subscribe({
      next: p => { this.productos.set(p); this.cargando.set(false); },
      error: () => { this.error.set('No se pudo cargar el listado.'); this.cargando.set(false); },
    });
  }

  protected alta(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.api.crear(this.form.getRawValue()).subscribe(nuevo => {
      this.productos.update(p => [...p, nuevo]);
      this.aviso.set(`Producto «${nuevo.nombre}» creado.`);
      this.form.reset({ nombre: '', categoria: 'Accesorios', precio: 0, stock: 0 });
    });
  }

  protected eliminar(fila: Record<string, string | number>): void {
    this.api.borrar(Number(fila['id'])).subscribe(() => {
      this.productos.update(p => p.filter(x => x.id !== fila['id']));
      this.aviso.set(`Producto «${fila['nombre']}» eliminado.`);
    });
  }

  protected seleccionar(fila: Record<string, string | number>): void {
    this.seleccionado.set(fila as unknown as Producto);
  }
}
