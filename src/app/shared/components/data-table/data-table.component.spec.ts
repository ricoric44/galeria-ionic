import { TestBed } from '@angular/core/testing';
import { DataTableComponent } from './data-table.component';

const FILAS = Array.from({ length: 14 }, (_, i) => ({ nombre: `Producto ${String.fromCharCode(65 + i)}`, stock: i * 3 }));

function crear() {
  const fixture = TestBed.createComponent(DataTableComponent);
  fixture.componentRef.setInput('titulo', 'Prueba');
  fixture.componentRef.setInput('columnas', [{ clave: 'nombre', titulo: 'Nombre' }, { clave: 'stock', titulo: 'Stock', numerica: true }]);
  fixture.componentRef.setInput('filas', FILAS);
  fixture.componentRef.setInput('tamanoPagina', 5);
  fixture.detectChanges();
  return fixture;
}

describe('DataTableComponent', () => {
  it('pagina las filas recibidas por Input', () => {
    const f = crear();
    expect(f.nativeElement.querySelectorAll('tbody tr').length).toBe(5);
    expect(f.nativeElement.textContent).toContain('Página 1 de 3');
  });

  it('filtra con el buscador y avisa al padre con el Output', async () => {
    const f = crear();
    const emitidos: string[] = [];
    f.componentInstance.busquedaCambiada.subscribe(t => emitidos.push(t));
    const input: HTMLInputElement = f.nativeElement.querySelector('input[type=search]');
    input.value = 'producto c';
    input.dispatchEvent(new Event('input'));
    await f.whenStable();
    f.detectChanges();
    expect(f.nativeElement.querySelectorAll('tbody tr').length).toBe(1);
    expect(emitidos).toEqual(['producto c']);
  });

  it('ordena numericamente y marca aria-sort', () => {
    const f = crear();
    const botones: HTMLButtonElement[] = Array.from(f.nativeElement.querySelectorAll('th button'));
    botones[1].click();
    f.detectChanges();
    botones[1].click();
    f.detectChanges();
    expect(f.nativeElement.querySelectorAll('th')[1].getAttribute('aria-sort')).toBe('descending');
    expect(f.nativeElement.querySelector('tbody tr td').textContent).toContain('Producto N');
  });

  it('emite la fila al pulsarla', () => {
    const f = crear();
    let fila: unknown;
    f.componentInstance.filaSeleccionada.subscribe(x => (fila = x));
    f.nativeElement.querySelector('tbody tr').click();
    expect(fila).toEqual(FILAS[0]);
  });
});
