import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';

/** Pantalla de acceso: formulario reactivo con validación síncrona y mensajes de error asociados a cada campo. */
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [ReactiveFormsModule, RouterLink, IonContent, IonHeader, IonTitle, IonToolbar],
})
export class LoginPage {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  protected form = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });
  protected error = signal('');
  protected cargando = signal(false);

  protected async entrar(): Promise<void> {
    this.error.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.cargando.set(true);
    const { email, password } = this.form.getRawValue();
    const ok = await this.auth.login(email, password);
    this.cargando.set(false);
    if (!ok) {
      this.error.set('Correo o contraseña incorrectos.');
      return;
    }
    // Redirección contextual: vuelve a la URL pedida antes del login (solo rutas internas).
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    const interna = returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('//');
    this.router.navigateByUrl(interna ? returnUrl : '/inicio');
  }
}
