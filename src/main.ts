import { ApplicationConfig, enableProdMode, inject } from '@angular/core';
import { environment } from './environments/environment';

import * as Sentry from '@sentry/angular';
import { routes } from './app/app-routing.module';
import {
  provideHttpClient,
  withFetch,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { setContext } from '@apollo/client/link/context';
import { ApolloLink, InMemoryCache } from '@apollo/client/core';
import { provideRouter } from '@angular/router';
import { DataErrorComponent } from './app/shared/components/data-error/data-error.component';
import { AuthGuard } from './app/auth/auth.guard';
import { C } from '@angular/cdk/focus-monitor.d-CvvJeQRc';
import { CustomBreakpointsProvider } from './app/shared/custom-breakpoints';

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
    provideHttpClient(withFetch()),
    provideRouter(routes), // <-- added back
    provideApollo(() => {
      const httpLink = inject(HttpLink);

      const auth = setContext((operation, context) => {
        const token = localStorage.getItem('token');

        return {
          headers: {
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxZTQzNzliZi02MWM5LTQ1MmQtOTlhZi1jMWQ4OTU1ZWZiYmQiLCJlbWFpbCI6InpvcmFuLm1lc2VjQGdtYWlsLmNvbSIsImxhc3RQYXNzd29yZENoYW5nZSI6IjIwMjQtMDgtMzBUMDk6MDQ6MjMuMDQwWiIsInJvbGVzIjpbXSwiaWF0IjoxNzMzMjIyNzIyfQ.kRQkgHriBMCgZ5dsU-i_U-wr5d0ZkAfLKX4CRIBFNfI`,
          },
        };
      });

      return {
        link: ApolloLink.from([
          auth,
          httpLink.create({ uri: 'http://localhost:3000/graphql' }),
        ]),
        cache: new InMemoryCache(),
        // other options...
      };
    }),
    CustomBreakpointsProvider,
  ],
};
provideHttpClient(withInterceptorsFromDi());

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err)
);
