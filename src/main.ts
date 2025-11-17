import { ApplicationConfig, enableProdMode, inject } from '@angular/core';
import { environment } from './environments/environment';

import * as Sentry from '@sentry/angular';
import { routes } from './app/app-routing.module';
import {
  HTTP_INTERCEPTORS,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';

import { ApolloLink } from '@apollo/client/core';
import { provideRouter } from '@angular/router';
import { DataErrorComponent } from './app/shared/components/data-error/data-error.component';
import { AuthGuard } from './app/auth/auth.guard';
import { CustomBreakpointsProvider } from './app/shared/custom-breakpoints';
import { AuthInterceptor } from './app/auth/auth-interceptor';

import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { provideHttpClient } from '@angular/common/http';
import { InMemoryCache } from '@apollo/client';

if (environment.production) {
  Sentry.init({
    dsn: environment.sentryDsn,
    integrations: [],
    tracesSampleRate: 0.2,
  });

  enableProdMode();
}
export const appConfig: ApplicationConfig = {
  providers: [
    DataErrorComponent,
    AuthGuard,
    provideHttpClient(withInterceptorsFromDi()),
    provideRouter(routes), // <-- added back
    provideApollo(() => {
      const httpLink = inject(HttpLink);
      return {
        link: httpLink.create({ uri: 'http://localhost:3000/graphql' }),

        cache: new InMemoryCache(),
        // other options...
      };
    }),
    CustomBreakpointsProvider,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
};

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err)
);
