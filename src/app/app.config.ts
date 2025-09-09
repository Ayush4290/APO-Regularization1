import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideNativeDateAdapter } from '@angular/material/core';
import { authInterceptor } from './services/auth/auth.interceptor';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideNativeDateAdapter(),
    // importProvidersFrom(
    //   TranslateModule.forRoot({
    //     loader: {
    //       provide: TranslateLoader,
    //       useFactory: HttpLoaderFactory,
    //       deps: [HttpClient]
    //     }
    //   })
    // )
  ]
};

// export function HttpLoaderFactory(http: HttpClient) {
//   return new TranslateHttpLoader();
// }