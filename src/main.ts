import { ApplicationConfig, enableProdMode, inject } from '@angular/core';
import { environment } from './environments/environment';

import { HTTP_INTERCEPTORS, withInterceptorsFromDi } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import * as Sentry from '@sentry/angular';
import { routes } from './app/app-routing.module';
import { AppComponent } from './app/app.component';

import { provideRouter } from '@angular/router';
import { AuthInterceptor } from './app/auth/auth-interceptor';
import { AuthGuard } from './app/auth/auth.guard';

import { DataErrorComponent } from './app/shared/components/data-error/data-error.component';
import { CustomBreakpointsProvider } from './app/shared/custom-breakpoints';

import { provideHttpClient } from '@angular/common/http';
import { InMemoryCache } from '@apollo/client';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';

if (environment.production) {
    Sentry.init({
        dsn: environment.sentryDsn,
        integrations: [],
        tracesSampleRate: 0.2
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

                cache: new InMemoryCache()
                // other options...
            };
        }),
        CustomBreakpointsProvider,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true
        }
    ]
};

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
