import {
  Component,
  computed,
  DestroyRef,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { LayoutService } from 'src/app/services/layout.service';
import { DataError } from '../../types/data-error';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BehaviorSubject, Subscription, take } from 'rxjs';
import { CragsQuery, CragsGQL } from '../../../generated/graphql';
import { GraphQLError, GraphQLFormattedError } from 'graphql';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ROUTE_TYPES } from 'src/app/common/route-types.constants';
import { AuthService } from 'src/app/auth/auth.service';
import { User } from '@sentry/angular';
import { ScrollService } from 'src/app/services/scroll.service';
import { SearchService } from 'src/app/shared/services/search.service';

import { MatMenuModule } from '@angular/material/menu';
import { OrientationPipe } from 'src/app/shared/pipes/orientation.pipe';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MapComponent } from 'src/app/common/map/map.component';
import { GradeComponent } from 'src/app/shared/components/grade/grade.component';
import { MatCardModule } from '@angular/material/card';
import { CragsTocComponent } from './crags-toc/crags-toc.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouteTypePipe } from 'src/app/shared/pipes/route-type.pipe';
import { CragsFiltersService } from './crags-filters.service';
import { LoaderComponent } from 'src/app/shared/components/loader/loader.component';
import { DomSanitizer } from '@angular/platform-browser';
import { BreakpointService } from 'src/app/services/breakpoint.service';
import { ErrorLike } from '@apollo/client';

@Component({
  selector: 'app-crags',
  templateUrl: './crags.component.html',
  styleUrls: ['./crags.component.scss'],
  imports: [
    MatMenuModule,
    OrientationPipe,
    MatButtonModule,
    MatIconModule,
    MapComponent,
    GradeComponent,
    MatCardModule,
    CragsTocComponent,
    MatFormFieldModule,
    MatInputModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    RouteTypePipe,
    LoaderComponent,
  ],
})
export class CragsComponent implements OnInit {
  loading: boolean = true;
  cragsLoading: boolean = false;
  error: DataError = null;
  showMap = false;
  showFilters = true;

  countries: CragsQuery['countryBySlug'][];
  country: CragsQuery['countryBySlug'];

  crags$ = new BehaviorSubject<CragsQuery['countryBySlug']['crags']>([]);

  map: any;

  search = new FormControl();

  filteredCrags: CragsQuery['countryBySlug']['crags'] = [];

  routeTypes = ROUTE_TYPES;

  user: User;

  subscriptions: Subscription[] = [];
  cragSub: Subscription;

  private destroyRef = inject(DestroyRef);
  protected typeParamValues: Array<string> = [];

  protected myRouteTypes = computed(() => {
    return this.cragsFiltersService.allRouteTypes();
  });
  protected selectedAreas: string[] = [];
  protected selectedOrientations: string[] = [];
  protected selectedMinGrade: number | null = null;
  protected selectedMaxGrade: number | null = null;
  protected searchFieldVisible = true;
  params: any;
  constructor(
    private authService: AuthService,
    private layoutService: LayoutService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private cragsGQL: CragsGQL,
    private scrollService: ScrollService,
    private searchService: SearchService,
    private cragsFiltersService: CragsFiltersService,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    protected breakpointService: BreakpointService
  ) {
    const url = this.domSanitizer.bypassSecurityTrustResourceUrl(
      '../../../assets/icons/orientation.svg'
    );
    this.matIconRegistry.addSvgIcon('orientation', url);
  }

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

      this.typeParamValues = [];
      if (params['tip']) {
        this.typeParamValues = JSON.parse(params['tip']);
        if (this.typeParamValues.length === 0) {
          this.typeParamValues = [];
        } else {
          this.typeParamValues = this.typeParamValues.map(
            (slug) => this.routeTypes.find((rt) => rt.slug === slug)?.id
          );
        }
      } else {
        this.typeParamValues = [];
      }

      this.selectedAreas = [];
      if (params['obmocje']) {
        this.selectedAreas = JSON.parse(params['obmocje']);
      }

      this.selectedOrientations = [];
      if (params['orientacija']) {
        this.selectedOrientations = JSON.parse(params['orientacija']);
      }

      this.selectedMinGrade = null;
      if (params['minGrade']) {
        this.selectedMinGrade = Number(params['minGrade']);
      }

      this.selectedMaxGrade = null;
      if (params['maxGrade']) {
        this.selectedMaxGrade = Number(params['maxGrade']);
      }

      this.cragSub = this.cragsGQL
        .fetch({
          variables: {
            country: params.country,
            input: {
              areasSlugs: this.selectedAreas,
              routeTypeId:
                this.typeParamValues.length > 0
                  ? this.typeParamValues
                  : ['sport'],
              type: 'sport',
              orientations: this.selectedOrientations,
              minGrade: this.selectedMinGrade,
              maxGrade: this.selectedMaxGrade,
              allowEmpty: true,
            },
          },
          fetchPolicy: 'no-cache',
        })
        .subscribe({
          next: (result) => {
            this.loading = false;
            this.cragsLoading = false;

            if (result.error != null) {
              this.queryError(result.error);
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

    this.subscriptions.push(this.cragSub);
    this.subscriptions.push(routeSub);
    this.subscriptions.push(authSub);

    const searchSub = this.search.valueChanges.subscribe(() => {
      this.filterCrags();
    });
    this.subscriptions.push(searchSub);

    this.destroyRef.onDestroy(() => {
      this.subscriptions.forEach((sub) => sub.unsubscribe());
    });
  }

  get nrOfFiltersApplied(): number {
    let nr = 0;
    if (this.typeParamValues.length > 0) {
      nr += this.typeParamValues.length;
    }
    if (this.selectedAreas.length > 0) {
      nr += this.selectedAreas.length;
    }
    return nr;
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
      this.country.crags[0];
      this.filteredCrags = this.country.crags.filter((crag) =>
        regExp.test(crag.name.toLowerCase())
      );
    }

    this.crags$.next(this.filteredCrags);
  }

  getAreaName(areaSlug: string): string {
    return this.country?.areas.find((a) => a.slug === areaSlug)?.name || '';
  }

  searchKeyDown(e: KeyboardEvent) {
    if (e.key == 'Enter' && this.filteredCrags.length == 1) {
      this.router.navigate(['/plezalisce', this.filteredCrags[0].slug]);
    }
  }

  queryError(error?: ErrorLike) {
    if (error.message == 'entity_not_found') {
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

  protected async removeAreaFilter() {
    this.selectedAreas = [];
    await this.router.navigate(
      this.makeRoute(this.country.slug, {
        tip: this.activatedRoute.snapshot.params['tip'] || null,
        orientacija: this.activatedRoute.snapshot.params['orientacija'] || null,
      }),
      { relativeTo: this.activatedRoute, onSameUrlNavigation: 'ignore' }
    );
  }

  protected async removeOrientationFilter() {
    this.selectedOrientations = [];
    await this.router.navigate(
      this.makeRoute(this.country.slug, {
        tip: this.activatedRoute.snapshot.params['tip'] || null,
        obmocje: this.activatedRoute.snapshot.params['obmocje'] || null,
      }),
      { relativeTo: this.activatedRoute, onSameUrlNavigation: 'ignore' }
    );
  }

  protected async removeRouteTypeFilter() {
    this.typeParamValues = [];
    await this.router.navigate(
      this.makeRoute(this.country.slug, {
        obmocje: this.activatedRoute.snapshot.params['obmocje'] || null,
        orientacija: this.activatedRoute.snapshot.params['orientacija'] || null,
      }),
      { relativeTo: this.activatedRoute, onSameUrlNavigation: 'ignore' }
    );
  }

  makeRoute(country: string, params: any = {}) {
    return ['/plezalisca', country, this.routeParams(params)];
  }

  routeParams(params: any): any {
    params = { ...this.params, ...params };

    Object.keys(params).forEach((key) => {
      if (params[key] == null) {
        delete params[key];
      }
    });

    return params;
  }

  protected removeAllFilters() {
    this.router.navigate(['/plezalisca']);
  }
}
