import { Component, computed, DestroyRef, inject, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { User } from '@sentry/angular';
import { BehaviorSubject, Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { ROUTE_TYPES } from 'src/app/common/route-types.constants';
import { LayoutService } from 'src/app/services/layout.service';
import { ScrollService } from 'src/app/services/scroll.service';
import { SearchService } from 'src/app/shared/services/search.service';
import { CragsGQL, CragsQuery, Season, WallAngle } from '../../../generated/graphql';
import { DataError } from '../../types/data-error';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { ErrorLike } from '@apollo/client';
import { MapComponent } from 'src/app/common/map/map.component';
import { SortableHeaderFieldComponent } from 'src/app/common/sortable-header-field/sortable-header-field.component';
import { BreakpointService } from 'src/app/services/breakpoint.service';
import { GradeComponent } from 'src/app/shared/components/grade/grade.component';
import { LoaderComponent } from 'src/app/shared/components/loader/loader.component';
import { TitleComponent } from 'src/app/shared/components/title/title.component';
import { IconSize } from 'src/app/shared/icons/icon-size.enum';
import { IconsModule } from 'src/app/shared/icons/icons.module';
import { CragTypePipe } from 'src/app/shared/pipes/crag-type.pipe';
import { IncludesPipe } from 'src/app/shared/pipes/includes.pipe';
import { OrientationPipe } from 'src/app/shared/pipes/orientation.pipe';
import { RouteTypePipe } from 'src/app/shared/pipes/route-type.pipe';
import { SeasonPipe } from 'src/app/shared/pipes/season.pipe';
import { WallAnglePipe } from 'src/app/shared/pipes/wall-angle.pipe';
import { CragsFiltersService } from './crags-filters.service';
import { CragsTocComponent } from './crags-toc/crags-toc.component';

@Component({
    selector: 'app-crags',
    templateUrl: './crags.component.html',
    styleUrls: ['./crags.component.scss'],
    imports: [
        MatMenuModule,
        OrientationPipe,
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
        TitleComponent,
        IconsModule,
        SeasonPipe,
        WallAnglePipe,
        IncludesPipe,
        CragTypePipe,
        SortableHeaderFieldComponent
    ]
})
export class CragsComponent implements OnInit {
    loading = true;
    cragsLoading = false;
    error: DataError = null;
    showMap = false;
    showFilters = true;

    countries: CragsQuery['countryBySlug'][];
    country: CragsQuery['countryBySlug'];

    crags$ = new BehaviorSubject<CragsQuery['countryBySlug']['crags']>([]);

    search = new FormControl();

    filteredCrags: CragsQuery['countryBySlug']['crags'] = [];

    routeTypes = ROUTE_TYPES;

    user: User;

    subscriptions: Subscription[] = [];
    cragSub: Subscription;

    private destroyRef = inject(DestroyRef);
    protected typeParamValues: string[] = [];
    protected iconSize = IconSize;
    protected seasons: Season[] = [Season.Autumn, Season.Summer, Season.Spring, Season.Winter];
    protected wallAngles: WallAngle[] = [WallAngle.Slab, WallAngle.Vertical, WallAngle.Overhang, WallAngle.Roof];

    protected myRouteTypes = computed(() => {
        return this.cragsFiltersService.allRouteTypes();
    });
    protected selectedAreas: string[] = [];
    protected selectedOrientations: string[] = [];
    protected selectedSeasons: string[] = [];
    protected selectedMinGrade: number | null = null;
    protected selectedMaxGrade: number | null = null;
    protected selectedWallAngles: string[] = [];
    protected selectedRainproof: boolean | null = null;
    protected selectedMinApproachTime: number | null = null;
    protected selectedMaxApproachTime: number | null = null;
    protected selectedAllowEmpty: boolean | null = null;
    protected searchFieldVisible = true;

    constructor(
        private authService: AuthService,
        private layoutService: LayoutService,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private cragsGQL: CragsGQL,
        private scrollService: ScrollService,
        private searchService: SearchService,
        private cragsFiltersService: CragsFiltersService,
        protected breakpointService: BreakpointService
    ) {}

    ngOnInit(): void {
        this.layoutService.$breadcrumbs.next([
            {
                name: 'Plezališča'
            }
        ]);

        this.loading = true;

        const authSub = this.authService.currentUser.subscribe((user) => (this.user = user));
        this.subscriptions.push(authSub);

        const routeSub = this.activatedRoute.params.subscribe((params) => {
            this.cragsLoading = true;

            this.typeParamValues = [];
            if (params['tip']) {
                this.typeParamValues = JSON.parse(params['tip']);
                if (this.typeParamValues.length === 0) {
                    this.typeParamValues = [];
                } else {
                    this.typeParamValues = this.typeParamValues.map((slug) => this.routeTypes.find((rt) => rt.slug === slug)?.id);
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

            this.selectedSeasons = [];
            if (params['sezona']) {
                this.selectedSeasons = JSON.parse(params['sezona']);
            }

            this.selectedMinGrade = null;
            if (params['minGrade']) {
                this.selectedMinGrade = Number(params['minGrade']);
            }

            this.selectedMaxGrade = null;
            if (params['maxGrade']) {
                this.selectedMaxGrade = Number(params['maxGrade']);
            }

            this.selectedRainproof = null;
            if (params['dez']) {
                this.selectedRainproof = params['dez'] === '1' ? true : null;
            }

            this.selectedWallAngles = [];
            if (params['naklon']) {
                this.selectedWallAngles = JSON.parse(params['naklon']);
            }

            this.selectedMinApproachTime = null;
            if (params['minPristopniCas']) {
                this.selectedMinApproachTime = Number(params['minPristopniCas']);
            }

            this.selectedMaxApproachTime = null;
            if (params['maxPristopniCas']) {
                this.selectedMaxApproachTime = Number(params['maxPristopniCas']);
            }

            this.selectedAllowEmpty = null;
            if (params['brezPodatkov']) {
                this.selectedAllowEmpty = params['brezPodatkov'] === '1' ? true : null;
            }

            this.cragSub = this.cragsGQL
                .fetch({
                    variables: {
                        country: params.country,
                        input: {
                            areasSlugs: this.selectedAreas,
                            routeTypeId: this.typeParamValues.length > 0 ? this.typeParamValues : ['sport'],
                            type: 'sport',
                            orientations: this.selectedOrientations,
                            minGrade: this.selectedMinGrade,
                            maxGrade: this.selectedMaxGrade,
                            seasons: this.selectedSeasons,
                            wallAngles: this.selectedWallAngles,
                            rainproof: this.selectedRainproof,
                            minApproachTime: this.selectedMinApproachTime,
                            maxApproachTime: this.selectedMaxApproachTime,
                            allowEmpty: this.selectedAllowEmpty
                        }
                    },
                    fetchPolicy: 'no-cache'
                })
                .subscribe({
                    next: (result) => {
                        this.loading = false;
                        this.cragsLoading = false;

                        if (result.error !== undefined) {
                            this.queryError(result.error);
                        } else {
                            this.querySuccess(result.data.countryBySlug);
                        }
                    },
                    error: () => {
                        this.loading = false;
                        this.queryError();
                    }
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
            nr++;
        }
        if (this.selectedAreas.length > 0) {
            nr++;
        }

        if (this.selectedOrientations.length > 0) {
            nr++;
        }

        if (this.selectedSeasons.length > 0) {
            nr++;
        }

        if (this.selectedMinGrade !== null) {
            nr++;
        }

        if (this.selectedMaxGrade !== null) {
            nr++;
        }

        if (this.selectedWallAngles.length > 0) {
            nr++;
        }

        if (this.selectedRainproof !== null) {
            nr++;
        }

        if (this.selectedMinApproachTime !== null || this.selectedMaxApproachTime !== null) {
            nr++;
        }

        if (this.selectedMinGrade !== null || this.selectedMaxGrade !== null) {
            nr++;
        }

        if (this.selectedAllowEmpty !== null) {
            nr++;
        }
        return nr;
    }

    filterCrags(): void {
        if (this.search.value === null) {
            this.filteredCrags = this.country.crags;
        } else {
            let searchTerm = this.search.value;
            searchTerm = searchTerm.toLowerCase();
            searchTerm = this.searchService.escape(searchTerm);
            searchTerm = this.searchService.ignoreAccents(searchTerm);

            const regExp = new RegExp(searchTerm);

            this.filteredCrags = this.country.crags.filter((crag) => regExp.test(crag.name.toLowerCase()));
        }

        this.crags$.next(this.filteredCrags);
    }

    getAreaName(areaSlug: string): string {
        return this.country?.areas.find((a) => a.slug === areaSlug)?.name || '';
    }

    searchKeyDown(e: KeyboardEvent) {
        if (e.key === 'Enter' && this.filteredCrags.length === 1) {
            this.router.navigate(['/plezalisce', this.filteredCrags[0].slug]);
        }
    }

    queryError(error?: ErrorLike) {
        if (error.message === 'entity_not_found') {
            this.error = {
                message: 'Država ne obstaja v bazi.'
            };
            return;
        }

        this.error = {
            message: 'Prišlo je do nepričakovane napake pri zajemu podatkov.'
        };
    }

    querySuccess(country: CragsQuery['countryBySlug']) {
        this.country = country;
        this.filterCrags();

        this.layoutService.$breadcrumbs.next([
            {
                name: 'Plezališča',
                path: '/plezalisca'
            },
            {
                name: this.country.name
            }
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
                naklon: this.activatedRoute.snapshot.params['naklon'] || null,
                sezona: this.activatedRoute.snapshot.params['sezona'] || null,
                dez: this.activatedRoute.snapshot.params['dez'] || null,
                minGrade: this.activatedRoute.snapshot.params['minGrade'] || null,
                maxGrade: this.activatedRoute.snapshot.params['maxGrade'] || null,
                minPristopniCas: this.activatedRoute.snapshot.params['minPristopniCas'] || null,
                maxPristopniCas: this.activatedRoute.snapshot.params['maxPristopniCas'] || null
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
                sezona: this.activatedRoute.snapshot.params['sezona'] || null,
                dez: this.activatedRoute.snapshot.params['dez'] || null,
                naklon: this.activatedRoute.snapshot.params['naklon'] || null,
                minGrade: this.activatedRoute.snapshot.params['minGrade'] || null,
                maxGrade: this.activatedRoute.snapshot.params['maxGrade'] || null,
                minPristopniCas: this.activatedRoute.snapshot.params['minPristopniCas'] || null,
                maxPristopniCas: this.activatedRoute.snapshot.params['maxPristopniCas'] || null
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
                sezona: this.activatedRoute.snapshot.params['sezona'] || null,
                naklon: this.activatedRoute.snapshot.params['naklon'] || null,
                dez: this.activatedRoute.snapshot.params['dez'] || null,
                minGrade: this.activatedRoute.snapshot.params['minGrade'] || null,
                maxGrade: this.activatedRoute.snapshot.params['maxGrade'] || null,
                minPristopniCas: this.activatedRoute.snapshot.params['minPristopniCas'] || null,
                maxPristopniCas: this.activatedRoute.snapshot.params['maxPristopniCas'] || null
            }),
            { relativeTo: this.activatedRoute, onSameUrlNavigation: 'ignore' }
        );
    }

    protected async removeSeasonFilter() {
        this.typeParamValues = [];
        await this.router.navigate(
            this.makeRoute(this.country.slug, {
                tip: this.activatedRoute.snapshot.params['tip'] || null,
                obmocje: this.activatedRoute.snapshot.params['obmocje'] || null,
                orientacija: this.activatedRoute.snapshot.params['orientacija'] || null,
                dez: this.activatedRoute.snapshot.params['dez'] || null,
                naklon: this.activatedRoute.snapshot.params['naklon'] || null,
                minGrade: this.activatedRoute.snapshot.params['minGrade'] || null,
                maxGrade: this.activatedRoute.snapshot.params['maxGrade'] || null,
                minPristopniCas: this.activatedRoute.snapshot.params['minPristopniCas'] || null,
                maxPristopniCas: this.activatedRoute.snapshot.params['maxPristopniCas'] || null
            }),
            { relativeTo: this.activatedRoute, onSameUrlNavigation: 'ignore' }
        );
    }

    protected async removeRainProofFilter() {
        this.selectedRainproof = null;
        await this.router.navigate(
            this.makeRoute(this.country.slug, {
                tip: this.activatedRoute.snapshot.params['tip'] || null,
                obmocje: this.activatedRoute.snapshot.params['obmocje'] || null,
                orientacija: this.activatedRoute.snapshot.params['orientacija'] || null,
                sezona: this.activatedRoute.snapshot.params['sezona'] || null,
                naklon: this.activatedRoute.snapshot.params['naklon'] || null,
                minGrade: this.activatedRoute.snapshot.params['minGrade'] || null,
                maxGrade: this.activatedRoute.snapshot.params['maxGrade'] || null,
                minPristopniCas: this.activatedRoute.snapshot.params['minPristopniCas'] || null,
                maxPristopniCas: this.activatedRoute.snapshot.params['maxPristopniCas'] || null
            }),
            { relativeTo: this.activatedRoute, onSameUrlNavigation: 'ignore' }
        );
    }

    protected async removeWallAngleFilter() {
        this.selectedWallAngles = [];
        await this.router.navigate(
            this.makeRoute(this.country.slug, {
                tip: this.activatedRoute.snapshot.params['tip'] || null,
                obmocje: this.activatedRoute.snapshot.params['obmocje'] || null,
                orientacija: this.activatedRoute.snapshot.params['orientacija'] || null,
                sezona: this.activatedRoute.snapshot.params['sezona'] || null,
                dez: this.activatedRoute.snapshot.params['dez'] || null,
                minGrade: this.activatedRoute.snapshot.params['minGrade'] || null,
                maxGrade: this.activatedRoute.snapshot.params['maxGrade'] || null,
                minPristopniCas: this.activatedRoute.snapshot.params['minPristopniCas'] || null,
                maxPristopniCas: this.activatedRoute.snapshot.params['maxPristopniCas'] || null
            }),
            { relativeTo: this.activatedRoute, onSameUrlNavigation: 'ignore' }
        );
    }

    protected async removeGradeFilter() {
        this.selectedMinGrade = null;
        this.selectedMaxGrade = null;
        await this.router.navigate(
            this.makeRoute(this.country.slug, {
                tip: this.activatedRoute.snapshot.params['tip'] || null,
                obmocje: this.activatedRoute.snapshot.params['obmocje'] || null,
                orientacija: this.activatedRoute.snapshot.params['orientacija'] || null,
                sezona: this.activatedRoute.snapshot.params['sezona'] || null,
                dez: this.activatedRoute.snapshot.params['dez'] || null,
                naklon: this.activatedRoute.snapshot.params['naklon'] || null,
                minPristopniCas: this.activatedRoute.snapshot.params['minPristopniCas'] || null,
                maxPristopniCas: this.activatedRoute.snapshot.params['maxPristopniCas'] || null
            }),
            { relativeTo: this.activatedRoute, onSameUrlNavigation: 'ignore' }
        );
    }

    protected async removeApproachTimeFilter() {
        this.selectedMinApproachTime = null;
        this.selectedMaxApproachTime = null;
        await this.router.navigate(
            this.makeRoute(this.country.slug, {
                tip: this.activatedRoute.snapshot.params['tip'] || null,
                obmocje: this.activatedRoute.snapshot.params['obmocje'] || null,
                orientacija: this.activatedRoute.snapshot.params['orientacija'] || null,
                sezona: this.activatedRoute.snapshot.params['sezona'] || null,
                dez: this.activatedRoute.snapshot.params['dez'] || null,
                naklon: this.activatedRoute.snapshot.params['naklon'] || null,
                minGrade: this.activatedRoute.snapshot.params['minGrade'] || null,
                maxGrade: this.activatedRoute.snapshot.params['maxGrade'] || null
            }),
            { relativeTo: this.activatedRoute, onSameUrlNavigation: 'ignore' }
        );
    }

    makeRoute(country: string, params: Record<string, string | null> = {}) {
        return ['/plezalisca', country, this.routeParams(params)];
    }

    routeParams(params: Record<string, string | null>): Record<string, string> {
        params = { ...params };

        Object.keys(params).forEach((key) => {
            if (params[key] === null) {
                delete params[key];
            }
        });

        return params;
    }

    protected removeAllFilters() {
        this.router.navigate(['/plezalisca']);
    }

    protected onSortableHeaderClick() {
        console.log('sortable header clicked');
    }
}
