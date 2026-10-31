import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';
import { emailUnico } from '../../core/validators/email-unico.validator';

/** Que las dos contraseñas coincidan (validador de grupo). */
const coinciden = (grupo: AbstractControl): ValidationErrors | null =>
  grupo.get('password')?.value === grupo.get('repetir')?.value ? null : { noCoinciden: true };

/**
 * Alta de usuarios. Demuestra data binding bidireccional (`[(ngModel)]`-equivalente con formControl),
 * validación asíncrona contra la API (correo único) y gestión del estado `PENDING` del control.
 */
@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  imports: [ReactiveFormsModule, RouterLink, IonContent, IonHeader, IonTitle, IonToolbar],
})
export class RegistroPage {
  private http = inject(HttpClient);
  private router = inject(Router);

  protected form = inject(FormBuilder).nonNullable.group(
    {
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email], [emailUnico(this.http)]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d).+$/)]],
      repetir: ['', Validators.required],
    },
    { validators: coinciden },
  );
  protected error = signal('');
  protected enviando = signal(false);
  protected creado = signal(false);

  protected enviar(): void {
    this.error.set('');
    if (this.form.invalid || this.form.pending) {
      this.form.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    const { nombre, email, password } = this.form.getRawValue();
    this.http.post('/api/auth/registro', { nombre, email, password }).subscribe({
      next: () => {
        this.enviando.set(false);
        this.creado.set(true);
        setTimeout(() => this.router.navigate(['/login']), 1800);
      },
      error: () => {
        this.enviando.set(false);
        this.error.set('No se pudo crear la cuenta. Revisa el correo e inténtalo de nuevo.');
      },
    });
  }
}
