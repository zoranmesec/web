import { CUSTOM_ELEMENTS_SCHEMA, Component, Inject, OnDestroy, OnInit, Optional } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';

import { HeaderComponent } from './layout/header/header.component';

import { BreadcrumbsComponent } from './layout/breadcrumbs/breadcrumbs.component';

import { LoginComponent } from './auth/login/login.component';

import { MAT_DATE_LOCALE, NativeDateAdapter } from '@angular/material/core';

import { registerLocaleData } from '@angular/common';
import localeSl from '@angular/common/locales/sl';
import { NavigationEnd, Router, RouterLink, RouterModule } from '@angular/router';
registerLocaleData(localeSl);

import { Subscription, filter, take } from 'rxjs';
import { AuthService } from './auth/auth.service';
import { LayoutService } from './services/layout.service';
import { ScrollService } from './services/scroll.service';

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
declare let gtag: Function;

export class CustomDateAdapter extends NativeDateAdapter {
    constructor(@Optional() @Inject(MAT_DATE_LOCALE) matDateLocale: string) {
        super(matDateLocale);
    }

    getFirstDayOfWeek = () => 1;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parse(value: any): Date {
        const arr = value.split('.');
        if (arr.length === 3) {
            return new Date(`${arr[1]}. ${arr[0]}. ${arr[2]}`);
        }

        return super.parse(value);
    }
}

@Component({
    selector: 'app-root',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    templateUrl: './app.component.html',
    imports: [RouterLink, HeaderComponent, BreadcrumbsComponent, RouterModule],
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
    title = 'plezanje-net';
    nowYear = new Date().getFullYear();

    subscriptions: Subscription[] = [];

    constructor(
        private authService: AuthService,
        private dialog: MatDialog,
        private router: Router,
        private layoutService: LayoutService,
        private scrollService: ScrollService
    ) {}

    ngOnInit(): void {
        this.authService.initialize();

        const loginSub = this.authService.openLogin$.subscribe((req) => {
            if (!this.router.navigated) {
                this.router.navigate(['/']);
            }

            this.dialog
                .open(LoginComponent, {
                    data: {
                        message: req.message
                    }
                })
                .afterClosed()
                .pipe(
                    take(1),
                    filter((data) => {
                        if (req.success !== null && data === null) {
                            req.success.next(false);
                        }
                        return data !== null && data !== '';
                    })
                )
                .subscribe((data) => {
                    if (req.returnUrl !== null) {
                        this.router.navigateByUrl(req.returnUrl);
                    }

                    if (req.success !== null) {
                        req.success.next(data);
                    }
                });
        });
        this.subscriptions.push(loginSub);

        // Fallback page title - if title should differentiate from breadcrumbs, the setTitle has to be called in corresponding component
        const breadcrumbsSub = this.layoutService.$breadcrumbs.subscribe((list) =>
            this.layoutService.setTitle(list.length > 0 ? list.slice(-1)[0].name : undefined)
        );
        this.subscriptions.push(breadcrumbsSub);

        const routerSub = this.router.events
            .pipe(filter((event) => event instanceof NavigationEnd))
            .subscribe(() => gtag('event', 'page_view'));

        this.subscriptions.push(routerSub);

        this.scrollService.startCachingScrollPositions();
        this.scrollService.enableDefaultScrollToTop();
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((sub) => sub.unsubscribe());
    }
}
