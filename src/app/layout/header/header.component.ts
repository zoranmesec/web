import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { User } from '../../../generated/graphql';

import { MatButtonModule } from '@angular/material/button';
import { BreakpointService } from 'src/app/services/breakpoint.service';
import { IconsModule } from 'src/app/shared/icons/icons.module';
@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    imports: [MatMenuModule, RouterLink, MatButtonModule, IconsModule]
})
export class HeaderComponent implements OnInit, OnDestroy {
    public naviOpen = false;

    subscriptions: Subscription[] = [];
    user: User;
    currentUrl = '';
    constructor(
        private router: Router,
        private authService: AuthService,
        private snackbar: MatSnackBar,
        protected readonly breakpointService: BreakpointService
    ) {}

    ngOnInit(): void {
        const naviSub = this.router.events.subscribe((val) => {
            if (val instanceof NavigationEnd) {
                this.naviOpen = false;
                this.currentUrl = val.url;
            }
        });
        this.subscriptions.push(naviSub);

        const authSub = this.authService.currentUser.subscribe((user) => {
            this.user = user;
            console.log('Header user updated: ', user);
        });
        this.subscriptions.push(authSub);
    }

    toggleNavi(): void {
        this.naviOpen = !this.naviOpen;
    }

    async logout() {
        await this.authService.logout();
        this.snackbar.open('Uspešno si se odjavil', null, { duration: 3000 });
        this.router.navigate(['/']);
    }

    login() {
        this.authService.openLogin$.next({
            message: 'Prijavi se za pregled svojega dnevnika ali oddajanje komentarjev.'
        });
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((sub) => sub.unsubscribe());
    }
}
