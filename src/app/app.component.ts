import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
import {
  APP_INITIALIZER,
  ErrorHandler,
  Inject,
  Optional,
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FlexLayoutModule } from 'ng-flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import {
  MatFormFieldModule,
  MatFormFieldDefaultOptions,
  MAT_FORM_FIELD_DEFAULT_OPTIONS,
} from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HeaderComponent } from './layout/header/header.component';
import { CragsComponent } from './pages/crags/crags.component';
import { HomeComponent } from './pages/home/home.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { BreadcrumbsComponent } from './layout/breadcrumbs/breadcrumbs.component';
import { GraphQLModule } from './graphql/graphql.module';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { CragsTocComponent } from './pages/crags/crags-toc/crags-toc.component';
import { CragComponent } from './pages/crag/crag.component';
import { LoginComponent } from './auth/login/login.component';
import { ProfileComponent } from './pages/account/profile/profile.component';
import { AuthGuard } from './auth/auth.guard';
import { AuthInterceptor } from './auth/auth-interceptor';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PasswordRecoveryComponent } from './auth/password-recovery/password-recovery.component';
import { RegisterComponent } from './pages/account/register/register.component';
import { ConfirmAccountComponent } from './pages/account/confirm-account/confirm-account.component';
import { SelectPasswordComponent } from './pages/account/select-password/select-password.component';
import { MapComponent } from './common/map/map.component';
import { CragRoutesComponent } from './pages/crag/crag-routes/crag-routes.component';
import { CragInfoComponent } from './pages/crag/crag-info/crag-info.component';
import { CragCommentsComponent } from './pages/crag/crag-comments/crag-comments.component';
import {
  DateAdapter,
  MatNativeDateModule,
  MAT_DATE_LOCALE,
  NativeDateAdapter,
} from '@angular/material/core';

import { Platform } from '@angular/cdk/platform';
import { CommonModule, NgIf, registerLocaleData } from '@angular/common';
import localeSl from '@angular/common/locales/sl';
registerLocaleData(localeSl);
import * as Sentry from '@sentry/angular';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterModule,
} from '@angular/router';

import { ScrollService } from './services/scroll.service';
import { Subscription, take, filter } from 'rxjs';
import { AuthService } from './auth/auth.service';
import { LayoutService } from './services/layout.service';
import { DataErrorComponent } from './shared/components/data-error/data-error.component';

declare let gtag: Function;

const formFieldAppearance: MatFormFieldDefaultOptions = {
  appearance: 'fill',
};

class CustomDateAdapter extends NativeDateAdapter {
  constructor(@Optional() @Inject(MAT_DATE_LOCALE) matDateLocale: string) {
    super(matDateLocale);
  }

  getFirstDayOfWeek = () => 1;

  parse(value: any): Date {
    const arr = value.split('.');
    if (arr.length == 3) {
      return new Date(`${arr[1]}. ${arr[0]}. ${arr[2]}`);
    }

    return super.parse(value);
  }
}

@Component({
  standalone: true,
  selector: 'app-root',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './app.component.html',
  imports: [
    RouterLink,
    HeaderComponent,
    BreadcrumbsComponent,
    CommonModule,
    RouterModule,
  ],
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: formFieldAppearance,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    { provide: MAT_DATE_LOCALE, useValue: 'sl-SI' },
    {
      provide: DateAdapter,
      useClass: CustomDateAdapter,
      deps: [MAT_DATE_LOCALE, Platform],
    },
  ],
  styleUrls: ['./app.component.scss'],
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
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private scrollService: ScrollService
  ) {
    this.matIconRegistry.addSvgIcon(
      'multipitch',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../assets/icons/multipitch.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'toprope',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../assets/icons/toprope.svg'
      )
    );

    this.matIconRegistry.registerFontClassAlias(
      'matSymbols',
      'material-symbols'
    );
  }

  ngOnInit(): void {
    this.authService.initialize();

    const loginSub = this.authService.openLogin$.subscribe((req) => {
      if (!this.router.navigated) {
        this.router.navigate(['/']);
      }

      this.dialog
        .open(LoginComponent, {
          data: {
            message: req.message,
          },
        })
        .afterClosed()
        .pipe(
          take(1),
          filter((data) => {
            if (req.success != null && data === null) {
              req.success.next(false);
            }
            return data != null && data != '';
          })
        )
        .subscribe((data) => {
          if (req.returnUrl != null) {
            this.router.navigateByUrl(req.returnUrl);
          }

          if (req.success != null) {
            req.success.next(data);
          }
        });
    });
    this.subscriptions.push(loginSub);

    // Fallback page title - if title should differentiate from breadcrumbs, the setTitle has to be called in corresponding component
    const breadcrumbsSub = this.layoutService.$breadcrumbs.subscribe((list) =>
      this.layoutService.setTitle(
        list.length > 0 ? list.slice(-1)[0].name : undefined
      )
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
