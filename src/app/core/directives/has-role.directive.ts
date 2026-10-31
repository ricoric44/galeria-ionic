import { Directive, TemplateRef, ViewContainerRef, effect, inject, input } from '@angular/core';
import { AuthService } from '../services/auth.service';

// Directiva estructural: *hasRole="'admin'" o *hasRole="['admin','supervisor']".
// El elemento solo existe en el DOM si el rol de la sesión coincide.
@Directive({ selector: '[hasRole]', standalone: true })
export class HasRoleDirective {
  private plantilla = inject(TemplateRef<unknown>);
  private vista = inject(ViewContainerRef);
  private auth = inject(AuthService);

  public hasRole = input.required<string | string[]>();

  constructor() {
    effect(() => {
      this.vista.clear();
      const roles = [this.hasRole()].flat();
      const rol = this.auth.currentUser()?.role;
      if (rol && roles.includes(rol)) {
        this.vista.createEmbeddedView(this.plantilla);
      }
    });
  }
}
