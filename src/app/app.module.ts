import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { mockBackendInterceptor } from './core/interceptors/mock-backend.interceptor';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular/lazy';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { GaleriaComponent } from './galeria/galeria.component';

@NgModule({
  declarations: [AppComponent, GaleriaComponent],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    // El orden define el pipeline: primero la autenticación, el servidor simulado el último.
    provideHttpClient(withInterceptors([authInterceptor, mockBackendInterceptor])),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
