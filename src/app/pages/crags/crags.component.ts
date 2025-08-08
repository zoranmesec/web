import { Component, OnDestroy, OnInit } from '@angular/core';
import { LayoutService } from 'src/app/services/layout.service';
import { DataError } from '../../types/data-error';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Subscription, take } from 'rxjs';
import { CragsQuery, CragsGQL } from '../../../generated/graphql';
import { GraphQLError, GraphQLFormattedError } from 'graphql';
import { UntypedFormControl } from '@angular/forms';
import { ROUTE_TYPES } from 'src/app/common/route-types.constants';
import { AuthService } from 'src/app/auth/auth.service';
import { User } from '@sentry/angular';
import { ScrollService } from 'src/app/services/scroll.service';
import { SearchService } from 'src/app/shared/services/search.service';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { OrientationPipe } from 'src/app/shared/pipes/orientation.pipe';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MapComponent } from 'src/app/common/map/map.component';
import { GradeComponent } from 'src/app/shared/components/grade/grade.component';
import { MatCardModule } from '@angular/material/card';
import { CragsTocComponent } from './crags-toc/crags-toc.component';
import { FlexLayoutModule } from 'ng-flex-layout';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-crags',
  templateUrl: './crags.component.html',
  styleUrls: ['./crags.component.scss'],
  imports: [
    CommonModule,
    MatMenuModule,
    OrientationPipe,
    MatButtonModule,
    MatIconModule,
    MapComponent,
    GradeComponent,
    MatCardModule,
    CragsTocComponent,
    FlexLayoutModule,
    MatFormFieldModule,
    MatInputModule,
  ],
})
export class CragsComponent implements OnInit, OnDestroy {
  loading: boolean = true;
  cragsLoading: boolean = false;
  error: DataError = null;
  showMap = false;
  showFilters = false;

  countries: CragsQuery['countryBySlug'][];
  country: CragsQuery['countryBySlug'];

  crags$ = new BehaviorSubject<CragsQuery['countryBySlug']['crags']>([]);

  map: any;

  search = new UntypedFormControl();

  filteredCrags: CragsQuery['countryBySlug']['crags'] = [];

  routeTypes = ROUTE_TYPES;

  user: User;

  subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private layoutService: LayoutService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private cragsGQL: CragsGQL,
    private scrollService: ScrollService,
    private searchService: SearchService
  ) {}

  ngOnInit(): void {
    this.layoutService.$breadcrumbs.next([
      {
        name: 'Plezališča',
      },
    ]);

    this.loading = true;

    const authSub = this.authService.currentUser.subscribe(
      (user) => (this.user = user)
    );
    this.subscriptions.push(authSub);

    const routeSub = this.activatedRoute.params.subscribe((params) => {
      this.cragsLoading = true;

      const rotueType = this.routeTypes.find((rt) => rt.slug === params['tip']);

      this.cragsGQL
        .fetch({
          country: params.country,
          input: {
            areaSlug: params['obmocje'],
            routeTypeId: rotueType?.id,
            type: 'sport',
            allowEmpty: true,
          },
        })
        .pipe(take(1))
        .subscribe({
          next: (result) => {
            this.loading = false;
            this.cragsLoading = false;

            if (result.errors != null) {
              this.queryError(result.errors);
            } else {
              this.querySuccess(result.data.countryBySlug);
            }
          },
          error: () => {
            this.loading = false;
            this.queryError();
          },
        });
    });

    this.subscriptions.push(authSub);

    const searchSub = this.search.valueChanges.subscribe(() =>
      this.filterCrags()
    );
    this.subscriptions.push(searchSub);
  }

  filterCrags(): void {
    if (this.search.value == null) {
      this.filteredCrags = this.country.crags;
    } else {
      let searchTerm = this.search.value;
      searchTerm = searchTerm.toLowerCase();
      searchTerm = this.searchService.escape(searchTerm);
      searchTerm = this.searchService.ignoreAccents(searchTerm);

      const regExp = new RegExp(searchTerm);

      this.filteredCrags = this.country.crags.filter((crag) =>
        regExp.test(crag.name.toLowerCase())
      );
    }

    this.crags$.next(this.filteredCrags);
  }

  searchKeyDown(e: KeyboardEvent) {
    if (e.key == 'Enter' && this.filteredCrags.length == 1) {
      this.router.navigate(['/plezalisce', this.filteredCrags[0].slug]);
    }
  }

  queryError(errors?: readonly GraphQLFormattedError<Record<string, any>>[]) {
    if (
      errors &&
      errors.length > 0 &&
      errors[0].message == 'entity_not_found'
    ) {
      this.error = {
        message: 'Država ne obstaja v bazi.',
      };
      return;
    }

    this.error = {
      message: 'Prišlo je do nepričakovane napake pri zajemu podatkov.',
    };
  }

  querySuccess(country: CragsQuery['countryBySlug']) {
    this.country = country;

    this.filterCrags();

    this.layoutService.$breadcrumbs.next([
      {
        name: 'Plezališča',
        path: '/plezalisca',
      },
      {
        name: this.country.name,
      },
    ]);

    this.layoutService.setTitle(['Seznam plezališč', this.country.name]);

    this.scrollService.restoreScroll();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
