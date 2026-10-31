import { TestBed } from '@angular/core/testing';
import { provideIonicAngular } from '@ionic/angular';

import { GaleriaComponent } from './galeria.component';

describe('GaleriaComponent', () => {
  it('muestra el título con interpolación', () => {
    TestBed.configureTestingModule({ imports: [GaleriaComponent], providers: [provideIonicAngular()] });
    const fixture = TestBed.createComponent(GaleriaComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Galería de paisajes');
  });
});
