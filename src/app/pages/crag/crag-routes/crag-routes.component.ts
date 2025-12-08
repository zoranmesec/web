import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, effect, ElementRef, Input, OnDestroy, OnInit, Signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';
import dayjs from 'dayjs';
import { FlexLayoutModule } from 'ng-flex-layout';
import { Subscription } from 'rxjs';
import { ActivityInputComponent } from 'src/app/activity/pages/activity-input/activity-input.component';
import { AuthService } from 'src/app/auth/auth.service';
import { SortableHeaderFieldComponent } from 'src/app/common/sortable-header-field/sortable-header-field.component';
import { CragActivityRouteComponent } from 'src/app/pages/crag/crag-route-activity/crag-activity-route.component';
import { BreakpointService } from 'src/app/services/breakpoint.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { AscentTypeComponent } from 'src/app/shared/components/ascent-type/ascent-type.component';
import { CommentFormComponent } from 'src/app/shared/components/comment-form/comment-form.component';
import { GradeComponent } from 'src/app/shared/components/grade/grade.component';
import { PublishStatusHintComponent } from 'src/app/shared/components/publish-status-hint/publish-status-hint.component';
import { StarRatingComponent } from 'src/app/shared/components/star-rating/star-rating.component';
import { IconsModule } from 'src/app/shared/icons/icons.module';
import { SearchService } from 'src/app/shared/services/search.service';
import { SnackBarButtonsComponent } from 'src/app/shared/snack-bar-buttons/snack-bar-buttons.component';
import ActivitySelection from 'src/app/types/activity-selection.interface';
import { AscentType, Crag, MyCragSummaryGQL, MyCragSummaryQuery, Route, Sector } from 'src/generated/graphql';
import { CragRoutePreviewComponent } from '../crag-route-preview/crag-route-preview.component';
import { allColumns, CragRoutesColumnsComponent } from './crag-routes-columns/crag-routes-columns.component';
import { CragRoutesFiltersService } from './crag-routes-filters.service';
import { CragRoutesFiltersComponent } from './crag-routes-filters/crag-routes-filters.component';

export interface ColumnType {
    field: string;
    selectLabel: string;
    tableLabel?: string;
    defaultSortDirection: number;
    width: number;
}

export interface ActivitySelectionData {
    crag: Crag;
    routes: Route[];
}

@Component({
    selector: 'app-crag-routes',
    templateUrl: './crag-routes.component.html',
    styleUrls: ['./crag-routes.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        FlexLayoutModule,
        MatSelectModule,
        MatFormFieldModule,
        MatInputModule,
        MatOptionModule,

        PublishStatusHintComponent,
        SortableHeaderFieldComponent,
        AscentTypeComponent,
        CragRoutePreviewComponent,
        MatIconModule,
        GradeComponent,
        MatMenuModule,
        RouterModule,
        MatButtonModule,
        MatExpansionModule,
        CragRoutesFiltersComponent,
        CragRoutesColumnsComponent,
        StarRatingComponent,
        IconsModule,
        MatTooltipModule
    ]
})
export class CragRoutesComponent implements OnInit, OnDestroy {
    @Input() crag: Crag;

    sectors: (Sector & {
        sortedDirection?: number;
        sortedField?: string;
        someRoutesShown: boolean;
    })[] = [];

    showFilters = true;
    showColumnSelection = false;

    // Provide some sensible default
    shownColumns = [
        'name',
        'length',
        'difficulty',
        'starRating',
        'multipitch',
        'nrTicks',
        'nrTries',
        'nrClimbers',
        'comments',
        'myAscents'
    ];

    hostResizeObserver: ResizeObserver;
    routeListViewStyle: 'compact' | 'table';
    tableWidth: number;
    availableWidth = 0;
    sortAll = ['position', 1];

    selectForm = new FormGroup({
        sortAll: new FormControl('', [Validators.required])
    });

    search = new FormControl();
    searchSub: Subscription;

    selectedRoutes: Route[] = [];
    selectedRoutesIds: string[] = [];
    ascents: MyCragSummaryQuery['myCragSummary'] = [];
    loading = false;
    expandedRowId: string;
    previousExpandedRowId: string;
    expandedRowHeight: number;

    protected searchFieldVisible = true;

    section: string;
    allColumns: Record<string, ColumnType> = allColumns;
    minGrade: Signal<number>;
    maxGrade: Signal<number>;

    constructor(
        private snackBar: MatSnackBar,
        private authService: AuthService,
        private router: Router,
        private myCragSummaryGQL: MyCragSummaryGQL,
        private localStorageService: LocalStorageService<ActivitySelectionData>,
        private changeDetection: ChangeDetectorRef,
        private hostElement: ElementRef,
        private searchService: SearchService,
        private dialog: MatDialog,
        protected breakpointService: BreakpointService,
        private cragRoutesFiltersService: CragRoutesFiltersService
    ) {
        this.minGrade = this.cragRoutesFiltersService.minGrade;
        this.maxGrade = this.cragRoutesFiltersService.maxGrade;

        effect(() => {
            this.filterRoutes();
            this.changeDetection.detectChanges();
        });
    }

    get nrOfFiltersApplied(): number {
        let nr = 0;
        if (this.cragRoutesFiltersService.minGrade() > 100 || this.cragRoutesFiltersService.maxGrade() < 2100) nr++;
        if (!this.cragRoutesFiltersService.starRating().every((s) => s === false)) nr++;
        if (this.cragRoutesFiltersService.myAscents() !== 'all') nr++;
        return nr;
    }

    openFilterDialog(event: Event) {
        event?.stopPropagation();
        // const dialogRef = this.dialog.open(CragFilterRouteComponent, {});

        // dialogRef.afterClosed().subscribe((result) => {
        //   console.log('The dialog was closed', result);
        // });
    }

    openDialog(event: Event, routeId: string, routeName: string) {
        event.stopPropagation();
        const dialogRef = this.dialog.open(CragActivityRouteComponent, {
            data: { routeId: routeId, routeName: routeName }
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.router.navigate(['/plezalni-dnevnik/vzponi', { routeId: routeId }]);
            }
        });
    }

    ngOnInit(): void {
        if (sessionStorage.getItem('shownColumns')) {
            this.shownColumns = JSON.parse(sessionStorage.getItem('shownColumns'));
        }

        // Hide length column if crag has only boulders
        if (this.crag.sectors.every((sector) => sector.bouldersOnly)) {
            delete this.allColumns.length;
            this.shownColumns = this.shownColumns.filter((column) => column !== 'length');
        }

        this.recalculateTableWidth();

        this.hostResizeObserver = new ResizeObserver((entries) => {
            this.availableWidth = entries[0].contentRect.width;
        });
        this.hostResizeObserver.observe(this.hostElement.nativeElement);

        // Make a copy (original is readonly and cannot be sorted or extended with fields)
        this.crag.sectors.forEach((sector) => {
            const routes = [];
            sector.routes.forEach((route) => routes.push({ ...route, show: true }));
            this.sectors.push({ ...sector, someRoutesShown: true, routes: routes });
        });
        this.searchSub = this.search.valueChanges.subscribe(() => {
            this.filterRoutes();
        });

        this.section = this.router.url.includes('/alpinizem/stena') ? 'alpinism' : 'sport';

        this.authService.currentUser.subscribe((user) => this.loadActivity(user !== null));

        const activitySelection: ActivitySelection = this.localStorageService.getItem('activity-selection');
        if (activitySelection && activitySelection.routes.length && activitySelection.crag.id === this.crag.id) {
            this.selectedRoutes = activitySelection.routes;
            this.selectedRoutesIds = this.selectedRoutes.map((route) => route.id);
            this.openSnackBar();
        }
    }

    ngOnDestroy(): void {
        this.snackBar.dismiss();
        this.hostResizeObserver.disconnect();
        this.searchSub.unsubscribe();
    }

    onSelectedColumnsSelectionChange() {
        sessionStorage.setItem('shownColumns', JSON.stringify(this.shownColumns));
        this.recalculateTableWidth();
    }

    recalculateTableWidth() {
        this.tableWidth = this.shownColumns.reduce((prev, curr) => prev + this.allColumns[curr].width, 40);
    }

    /**
     * sorts routes in all sectors by the same sort field and direction
     * used when compact view is shown and sort can be selected only from select input
     */
    sortAllRoutes(event: MatSelectChange) {
        const [field, direction] = event.value;
        this.sectors.forEach((_sector, index) => {
            this.sortRoutes(index, field, direction);
        });
    }

    onSortableHeaderClick(sectorIndex: number, sortField: string) {
        this.sortAll = null; // unset dropdown sort select input
        this.sortRoutes(sectorIndex, sortField);
    }

    /**
     * sorts routes in one sector
     * used when table view is shown and each sector can be sorted individually by clicking on fields in table header
     */
    sortRoutes(sectorIndex: number, sortField: string, sortDirection?: number) {
        if (sortDirection) {
            this.sectors[sectorIndex].sortedDirection = sortDirection;
        } else {
            if (sortField === 'position') {
                // sorting by position is always asc (left to right), sorting by any other field inverts direction on each click
                this.sectors[sectorIndex].sortedDirection = 1;
            } else {
                this.sectors[sectorIndex].sortedDirection =
                    this.sectors[sectorIndex].sortedField === sortField
                        ? this.sectors[sectorIndex].sortedDirection * -1
                        : (this.allColumns[sortField].defaultSortDirection ?? 1);
            }
        }

        this.sectors[sectorIndex].sortedField = sortField;

        this.sectors[sectorIndex].routes.sort((r1, r2) => {
            switch (this.sectors[sectorIndex].sortedField) {
                case 'difficulty':
                    if (r1.isProject && r2.isProject) return 0;
                    if (r1.isProject) return this.sectors[sectorIndex].sortedDirection;
                    if (r2.isProject) return this.sectors[sectorIndex].sortedDirection * -1;
                    break;

                case 'multipitch':
                    if (r1.pitches.length && r2.pitches.length) return 0;
                    if (r1.pitches.length) return this.sectors[sectorIndex].sortedDirection;
                    if (r2.pitches.length) return this.sectors[sectorIndex].sortedDirection * -1;
                    return 0;

                case 'comments':
                    if (r1.comments.length && r2.comments.length) return 0;
                    if (r1.comments.length) return this.sectors[sectorIndex].sortedDirection;
                    if (r2.comments.length) return this.sectors[sectorIndex].sortedDirection * -1;
                    return 0;

                case 'myAscents':
                    if (this.ascents[r1.id] && this.ascents[r2.id]) return 0;
                    if (this.ascents[r1.id]) return this.sectors[sectorIndex].sortedDirection;
                    if (this.ascents[r2.id]) return this.sectors[sectorIndex].sortedDirection * -1;
                    return 0;
            }

            // default sort mode:
            return r1[sortField] < r2[sortField]
                ? this.sectors[sectorIndex].sortedDirection * -1
                : this.sectors[sectorIndex].sortedDirection;
        });
    }

    filterRoutes(): void {
        let searchTerm = this.search?.value ?? '';
        searchTerm = searchTerm.toLowerCase();
        searchTerm = this.searchService.escape(searchTerm);
        searchTerm = this.searchService.ignoreAccents(searchTerm);

        const regExp = new RegExp(searchTerm);
        const myAscentsType = this.cragRoutesFiltersService.myAscents();
        this.sectors.forEach((sector) =>
            sector.routes.forEach((route: Route & { show: boolean }) => {
                let show = true;
                if (searchTerm.length > 0) {
                    show = regExp.test(route.name.toLowerCase());
                }
                if (
                    route.difficulty < this.cragRoutesFiltersService.minGrade() ||
                    route.difficulty > this.cragRoutesFiltersService.maxGrade()
                ) {
                    show = false;
                }

                const starRating = this.cragRoutesFiltersService.starRating();
                if (route.starRating === null && !starRating.every((s) => !s)) {
                    show = false;
                } else if (route.starRating !== null) {
                    if (!starRating.every((s) => !s) && !starRating[route.starRating]) {
                        show = false;
                    }
                }

                const myAscent = this.ascents[route.id] as AscentType;

                switch (myAscentsType) {
                    case 'attempted':
                        if (
                            myAscent === undefined ||
                            myAscent === AscentType.Redpoint ||
                            myAscent === AscentType.Flash ||
                            myAscent === AscentType.Onsight
                        )
                            show = false;
                        break;
                    case 'climbed':
                        if (!(myAscent === AscentType.Redpoint || myAscent === AscentType.Flash || myAscent === AscentType.Onsight))
                            show = false;
                        break;
                    case 'notClimbed':
                        if (myAscent === AscentType.Redpoint || myAscent === AscentType.Flash || myAscent === AscentType.Onsight)
                            show = false;
                        break;
                    case 'notAttempted':
                        if (myAscent !== undefined) show = false;
                        break;
                }
                route.show = show;
            })
        );

        this.sectors.forEach((sector) => (sector.someRoutesShown = sector.routes.some((route: Route & { show: boolean }) => route.show)));
    }

    onCheckBoxClick(event: Event) {
        event.stopPropagation();
    }

    changeSelection(route: Route): void {
        const i = this.selectedRoutes.findIndex((r) => r.id === route.id);
        if (i > -1) {
            this.selectedRoutes.splice(i, 1);
        } else {
            this.selectedRoutes.push(route);
        }

        if (this.selectedRoutes.length > 0) {
            this.openSnackBar();

            this.selectedRoutesIds = this.selectedRoutes.map((selectedRoute) => selectedRoute.id);

            this.localStorageService.setItem(
                'activity-selection',
                {
                    crag: this.crag,
                    routes: this.selectedRoutes
                },
                dayjs().add(1, 'day').toISOString()
            );
        } else {
            this.snackBar.dismiss();
            this.localStorageService.removeItem('activity-selection');
        }
    }

    openSnackBar(): void {
        this.snackBar
            .openFromComponent(SnackBarButtonsComponent, {
                horizontalPosition: 'end',
                data: {
                    buttons: [
                        {
                            label: `Shrani v plezalni dnevnik (${this.selectedRoutes.length})`
                        }
                    ]
                }
            })
            .onAction()
            .subscribe(() => this.addActivity());
    }
    toggleColumnSelection(): void {
        this.showColumnSelection = !this.showColumnSelection;
        this.showFilters = false;
    }

    toggleFilterSelection(): void {
        this.showFilters = !this.showFilters;
        this.showColumnSelection = false;
    }

    addRoutesToLocalStorage(routes: Route[]) {
        this.localStorageService.setItem(
            'activity-selection',
            {
                crag: this.crag,
                routes: routes
            },

            dayjs().add(1, 'day').toISOString()
        );
    }

    addActivity(): void {
        this.authService
            .guardedAction({
                message: 'Za uporabo plezalnega dnevnika se moraš prijaviti.'
            })
            .then((success) => {
                if (success) {
                    this.addRoutesToLocalStorage(this.selectedRoutes);

                    this.dialog
                        .open(ActivityInputComponent, {
                            data: {
                                crag: this.crag
                            },
                            minWidth: this.breakpointService.sgLtMd() ? '95vw' : '80vw',
                            minHeight: this.breakpointService.sgLtMd() ? '95vh' : '80vh',
                            width: this.breakpointService.sgLtMd() ? '95vw' : '80vw',
                            height: this.breakpointService.sgLtMd() ? '95vh' : '80vh'
                        })
                        .afterClosed()
                        .subscribe((result) => {
                            if (result !== null) {
                                this.snackBar
                                    .open('Vnos je bil shranjen v plezalni dnevnik', 'Odpri dnevnik', {
                                        duration: 3000
                                    })
                                    .onAction()
                                    .subscribe(() => {
                                        if (this.crag) {
                                            this.router.navigate(['/plezalni-dnevnik/dnevnik']);
                                        }
                                    });
                            }
                        });

                    // this.router.navigate([
                    //   '/plezalni-dnevnik/vpis',
                    //   { crag: this.crag.id },
                    // ]);
                } else {
                    this.openSnackBar();
                }
            });
    }

    loadActivity(authenticated: boolean): void {
        if (!authenticated) {
            this.ascents = [];
            return;
        }

        this.myCragSummaryGQL.watch({ variables: { input: { cragId: this.crag.id } } }).valueChanges.subscribe((result) => {
            this.loading = false;
            result.data?.myCragSummary.forEach((ascent) => {
                this.ascents[ascent.route.id] = ascent.ascentType;
            });
            this.filterRoutes();
            this.changeDetection.detectChanges();
        });
    }

    expandRow(routeId: string): void {
        if (this.expandedRowId === routeId) {
            this.previousExpandedRowId = this.expandedRowId;
            this.expandedRowId = null;
        } else {
            this.previousExpandedRowId = this.expandedRowId;
            this.expandedRowId = routeId;
        }

        setTimeout(() => {
            /**
             * After the animation is finished, the previous row ID should be nulled.
             * This ensures that, if the user will click on the same (previous) row again, it will be rendered again and not just reused.
             * This should set the height for the animation properly.
             */
            this.previousExpandedRowId = null;
        }, 300);
    }

    async addImage() {
        // const allowed = await this.authService.guardedAction({});
        // if (allowed) {
        //   this.dialog
        //     .open(ImageUploadComponent, {
        //       data: {
        //         entityType: 'crag',
        //         entityId: this.crag.id,
        //         user: this.user,
        //       },
        //       autoFocus: false,
        //     })
        //     .afterClosed()
        //     .subscribe((result) => {
        //       if (!result) {
        //         return;
        //       }
        //       this.loading = true;
        //       this.cragQuery.refetch();
        //       if (this.activeTab !== 'galerija') {
        //         this.setActiveTab({
        //           slug: 'galerija',
        //           label: 'Galerija',
        //           icon: 'photo',
        //         });
        //       }
        //     });
        // }
    }

    addComment(type: string) {
        this.authService.guardedAction({}).then((success) => {
            if (success) {
                this.dialog.open(CommentFormComponent, {
                    data: {
                        crag: this.crag,
                        type: type
                    },
                    autoFocus: false
                });
            }
        });
    }

    onPreviewHeightEvent(height: number): void {
        this.expandedRowHeight = height;
        this.changeDetection.detectChanges();
    }

    onSelectedColumnsChange(columns: Record<string, ColumnType>): void {
        this.shownColumns = [];
        Object.keys(columns).map((key) => {
            this.shownColumns.push(key);
        });
        this.recalculateTableWidth();
    }
}
