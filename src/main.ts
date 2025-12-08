import { ApplicationConfig, enableProdMode, inject, provideZoneChangeDetection } from '@angular/core';
import { environment } from './environments/environment';

import { HTTP_INTERCEPTORS, withInterceptorsFromDi } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import * as Sentry from '@sentry/angular';
import { routes } from './app/app-routing.module';
import { AppComponent, CustomDateAdapter } from './app/app.component';

import { provideRouter } from '@angular/router';
import { AuthInterceptor } from './app/auth/auth-interceptor';
import { AuthGuard } from './app/auth/auth.guard';

import { DataErrorComponent } from './app/shared/components/data-error/data-error.component';
import { CustomBreakpointsProvider } from './app/shared/custom-breakpoints';

import { Platform } from '@angular/cdk/platform';
import { provideHttpClient } from '@angular/common/http';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
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
        { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'outline', floatLabel: 'always' } },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true
        },
        CustomBreakpointsProvider,

        { provide: MAT_DATE_LOCALE, useValue: 'sl-SI' },
        {
            provide: DateAdapter,
            useClass: CustomDateAdapter,
            deps: [MAT_DATE_LOCALE, Platform]
        },
        provideZoneChangeDetection()
    ]
};

bootstrapApplication(AppComponent, { ...appConfig, providers: [...appConfig.providers] }).catch((err) => console.error(err));
