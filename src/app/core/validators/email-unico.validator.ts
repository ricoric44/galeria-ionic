import { HttpClient } from '@angular/common/http';
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, catchError, map, of, switchMap, timer } from 'rxjs';

/**
 * Validador asíncrono: consulta al servicio si el correo ya está dado de alta.
 * El `timer` actúa de antirrebote (debounce): si el usuario sigue escribiendo, `switchMap` cancela la consulta anterior.
 */
export const emailUnico = (http: HttpClient, esperaMs = 400): AsyncValidatorFn =>
  (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value || control.hasError('email')) return of(null);
    return timer(esperaMs).pipe(
      switchMap(() => http.get<{ existe: boolean }>('/api/auth/existe', { params: { email: control.value } })),
      map(({ existe }) => (existe ? { emailEnUso: true } : null)),
      // Si el servicio falla no se bloquea el formulario: el servidor volverá a comprobarlo al guardar.
      catchError(() => of(null)),
    );
  };
