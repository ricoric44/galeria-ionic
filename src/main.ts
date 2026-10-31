import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { isDevMode } from '@angular/core';
import { provideServiceWorker } from '@angular/service-worker';
import { bootstrapApplication } from '@angular/platform-browser';
import { PreloadAllModules, RouteReuseStrategy, provideRouter, withPreloading } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { authInterceptor } from './app/core/interceptors/auth.interceptor';
import { mockBackendInterceptor } from './app/core/interceptors/mock-backend.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideServiceWorker('ngsw-worker.js', { enabled: !isDevMode(), registrationStrategy: 'registerWhenStable:30000' }),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    // El orden define el pipeline: primero la autenticación, el servidor simulado el último.
    provideHttpClient(withInterceptors([authInterceptor, mockBackendInterceptor])),
  ],
}).catch(err => console.error(err));
