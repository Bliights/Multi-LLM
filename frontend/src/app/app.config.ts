import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom  } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import {ApiModule, Configuration, ConfigurationParameters} from '../generated';
import { provideHttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';

const apiConfParams : ConfigurationParameters = {
  basePath: '/api', // override generated code
  withCredentials: true,
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    importProvidersFrom( ApiModule.forRoot(() => new Configuration(apiConfParams))
    )
  ]
};
