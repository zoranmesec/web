import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { GraphQLError } from 'graphql';
import { Observable, tap } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(
        private authService: AuthService,
        private snackbar: MatSnackBar,
        private router: Router
    ) {}

    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        const token = this.authService.getToken();
        if (token) {
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`
                }
            });

            return next.handle(request).pipe(
                tap((event) => {
                    if (event instanceof HttpResponse && event.body.errors !== null) {
                        this.checkForTokenExpiredError(event.body.errors);
                    }
                })
            );
        }

        return next.handle(request);
    }

    checkForTokenExpiredError(errors: GraphQLError[]) {
        if (errors !== undefined && errors.find((e) => e.message === 'token_expired')) {
            this.authService.logout().then(() => {
                this.snackbar.open('Zaradi spremmebe v uporabniškem računu se moraš ponovno prijavit', null, { duration: 3000 });
                this.router.navigate(['/']);
            });
        }
    }
}
