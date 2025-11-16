import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import {
  concatMap,
  debounceTime,
  filter,
  map,
  Observable,
  startWith,
  Subject,
  Subscription,
  switchMap,
  take,
} from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import {
  ASCENT_TYPES,
  PUBLISH_OPTIONS,
} from 'src/app/common/activity.constants';
import { LayoutService } from 'src/app/services/layout.service';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { GenderizeVerbPipe } from 'src/app/shared/pipes/genderize-verb.pipe';
import { DataError } from 'src/app/types/data-error';
import {
  ActivityRoute,
  FindActivityRoutesInput,
  MyActivityRoutesGQL,
  MyActivityRoutesQuery,
  ActivityFiltersCragGQL,
  ActivityFiltersCragQuery,
  ActivityFiltersRouteGQL,
  ActivityFiltersRouteQuery,
  namedOperations,
  DeleteActivityRouteGQL,
  GradingSystemsQuery,
  Crag,
  Route,
} from 'src/generated/graphql';
import { FilteredTable } from '../../../common/filtered-table';
import { CommonModule } from '@angular/common';
import { IconsModule } from 'src/app/shared/icons/icons.module';
import { MatButtonModule } from '@angular/material/button';
import { FlexLayoutModule } from 'ng-flex-layout';
import { ActivityHeaderComponent } from '../../partials/activity-header/activity-header.component';
import { DataErrorComponent } from 'src/app/shared/components/data-error/data-error.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatPaginatorModule } from '@angular/material/paginator';
import { LoaderComponent } from 'src/app/shared/components/loader/loader.component';
import { MatIconModule } from '@angular/material/icon';
import { ActivityRouteRowComponent } from '../../partials/activity-route-row/activity-route-row.component';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { BreakpointService } from 'src/app/services/breakpoint.service';
import { MatExpansionModule } from '@angular/material/expansion';
import { AscentTypeOptionComponent } from '../../forms/activity-form/activity-form-route/ascent-type-option/ascent-type-option.component';
import { MatRadioModule } from '@angular/material/radio';
import { ROUTE_TYPES } from 'src/app/common/route-types.constants';
import { MatSliderModule } from '@angular/material/slider';
import { GradingSystemsService } from 'src/app/shared/services/grading-systems.service';
import {
  SearchComponent,
  SearchType,
} from 'src/app/pages/search/search.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MaterialElevationDirective } from 'src/app/shared/directives/material-elevation.directive';
export interface RowAction {
  item: ActivityRoute;
  action: string;
}

const MIN_GRADE = 100;
const MAX_GRADE = 2100;

@Component({
  selector: 'app-activity-routes',
  templateUrl: './activity-routes.component.html',
  styleUrls: ['./activity-routes.component.scss'],
  standalone: true,
  imports: [
    IconsModule,
    CommonModule,
    MatButtonModule,
    FlexLayoutModule,
    ActivityHeaderComponent,
    DataErrorComponent,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatPaginatorModule,
    LoaderComponent,
    MatIconModule,
    ActivityRouteRowComponent,
    MatSelectModule,
    MatMenuModule,
    FormsModule,
    ReactiveFormsModule,
    MatExpansionModule,
    AscentTypeOptionComponent,
    MatRadioModule,
    MatSliderModule,
    SearchComponent,
    MatAutocompleteModule,
  ],
})
export class ActivityRoutesComponent implements OnInit, OnDestroy {
  error: DataError = null;

  routes: MyActivityRoutesQuery['myActivityRoutes']['items'];
  pagination: MyActivityRoutesQuery['myActivityRoutes']['meta'];
  allGrades: GradingSystemsQuery['gradingSystems'][0]['grades'] = [];
  loading = false;

  filters = this.fb.group({
    dateFrom: new FormControl(),
    dateTo: new FormControl(),
    ascentType: new FormControl(),
    cragId: new FormControl(),
    routeId: new FormControl(),
    routeTypes: new FormControl([]),
    topRope: new FormControl(false),
    publish: new FormGroup({}),
    sport: new FormControl(false, {
      validators: [],
      nonNullable: true,
    }),
    boulder: new FormControl(false, {
      validators: [],
      nonNullable: true,
    }),
    multipitch: new FormControl(false, {
      validators: [],
      nonNullable: true,
    }),
  });

  gradeForm = this.fb.group({
    minGrade: this.fb.control(
      { value: MIN_GRADE, disabled: false },
      { validators: [] }
    ),
    maxGrade: this.fb.control(
      { value: MAX_GRADE, disabled: false },
      { validators: [] }
    ),
  });

  forCrag: ActivityFiltersCragQuery['crag'];
  forRoute: ActivityFiltersRouteQuery['route'];

  filteredTable = new FilteredTable(
    [
      { name: 'date', label: 'Datum', sortable: true, defaultSort: 'DESC' },
      { name: 'crag', label: 'Plezališče' },
      { name: 'route', label: 'Smer' },
      { name: 'grade', label: 'Ocena', sortable: true },
      { name: 'ascentType', label: 'Vrsta vzpona' },
      { name: 'notes', label: 'Opombe' },
      { name: 'publish', label: 'Vidnost' },
    ],
    [
      { name: 'dateFrom', type: 'date' },
      { name: 'dateTo', type: 'date' },
      { name: 'ascentType', type: 'multiselect' },
      { name: 'publish', type: 'multiselect' },
      { name: 'cragId', type: 'relation' },
      { name: 'routeId', type: 'relation' },
      { name: 'routeTypes', type: 'multiselect' },
      { name: 'minGrade', type: 'number' },
      { name: 'maxGrade', type: 'number' },
    ]
  );
  ignoreFormChange = true;

  rowAction$ = new Subject<RowAction>();

  publishOptions = PUBLISH_OPTIONS;

  topRopeAscentTypes = ASCENT_TYPES.filter((ascentType) => ascentType.topRope);
  nonTopRopeAscentTypes = ASCENT_TYPES.filter(
    (ascentType) => !ascentType.topRope
  );

  subscriptions: Subscription[] = [];

  cragsLoading = true;
  noTopropeOnPage = false;

  protected routeTypes = ROUTE_TYPES;
  protected showFilters = true;
  protected showColumnSelection = false;
  protected searchFieldVisible = true;

  protected search = new FormControl();
  protected searchSub: Subscription;
  protected gradingSystemId: string = 'french';
  protected isSliderDragging = false;
  protected searchTypes = SearchType;
  protected routeSearchEnabled = false;
  protected minGrade = MIN_GRADE;
  protected maxGrade = MAX_GRADE;

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private layoutService: LayoutService,
    private genderizeVerbPipe: GenderizeVerbPipe,
    private myActivityRoutesGQL: MyActivityRoutesGQL,
    private activityFiltersCragGQL: ActivityFiltersCragGQL,
    private activityFiltersRouteGQL: ActivityFiltersRouteGQL,
    private deleteActivityRouteGQL: DeleteActivityRouteGQL,
    private gradingSystemService: GradingSystemsService,
    protected readonly breakpointService: BreakpointService,
    protected readonly fb: FormBuilder,
    private readonly cdr: ChangeDetectorRef
  ) {
    void this.fetchGrades();
  }

  ngOnInit(): void {
    this.layoutService.$breadcrumbs.next([
      {
        name: 'Plezalni dnevnik',
      },
    ]);
    this.publishOptions.forEach((option) => {
      (this.filters.get('publish') as FormGroup).addControl(
        option.value,
        new FormControl(false)
      );
    });

    const ft = this.filteredTable;

    const navSub = ft.navigate$.subscribe((params) => {
      this.router.navigate(['/plezalni-dnevnik/vzponi', params]);
    });
    this.subscriptions.push(navSub);

    const routeParamsSub = this.activatedRoute.params
      .pipe(
        switchMap((params) => {
          ft.setRouteParams(params);

          this.ignoreFormChange = true;
          this.filters.patchValue(ft.filterParams, { emitEvent: false });
          if (ft.filterParams.minGrade != null) {
            this.gradeForm.patchValue(
              { minGrade: ft.filterParams.minGrade },
              { emitEvent: false }
            );
          }
          if (ft.filterParams.maxGrade != null) {
            this.gradeForm.patchValue(
              { maxGrade: ft.filterParams.maxGrade },
              { emitEvent: false }
            );
          }
          this.applyRelationFilterDisplayValues();

          this.loading = true;

          const queryParams: FindActivityRoutesInput = ft.queryParams;

          return this.myActivityRoutesGQL.watch({ input: queryParams })
            .valueChanges;
        })
      )
      .subscribe({
        next: (result) => {
          this.loading = false;
          ft.navigating = false;
          this.ignoreFormChange = false;
          this.querySuccess(result.data.myActivityRoutes);
        },
        error: () => {
          this.queryError();
        },
      });

    this.subscriptions.push(routeParamsSub);

    const filtersSub = this.filters.valueChanges
      .pipe(
        filter(() => {
          return !this.ignoreFormChange; // date picker ignores emitEvent:false. This is a workaround
        }),
        debounceTime(100) // datepicker triggers 4 valueChanges events. this is a workaround
      )
      .subscribe((values) => {
        if (ft.navigating) {
          ft.navigating = false;
        } else {
          const newParams = { ...values };
          newParams.publish = Object.keys(newParams.publish).filter(
            (key) => newParams.publish[key] === true
          );
          newParams.routeTypes = [];
          if (newParams.sport) newParams.routeTypes.push('sport');
          if (newParams.boulder) newParams.routeTypes.push('boulder');
          if (newParams.multipitch) newParams.routeTypes.push('multipitch');
          ft.setFilterParams(newParams);
        }
      });
    this.subscriptions.push(filtersSub);

    const topRopeSub = this.filters
      .get('topRope')
      .valueChanges.subscribe(() => {
        this.filters.patchValue({ ascentType: [] });
      });
    this.subscriptions.push(topRopeSub);

    const rowActionsSub = this.rowAction$.subscribe((action) => {
      switch (action.action) {
        case 'filterByCrag':
          this.forCrag = action.item.route.crag;
          this.filters.patchValue({
            routeId: null,
            cragId: action.item.route.crag.id,
          });
          break;
        case 'filterByRoute':
          this.filters.patchValue({
            cragId: null,
            routeId: action.item.route.id,
          });
          break;
        case 'delete':
          this.deleteActivityRoute(action.item);
          break;
      }
    });
    this.subscriptions.push(rowActionsSub);
  }

  async fetchGrades(): Promise<void> {
    const gradingSystems = await this.gradingSystemService.getGradingSystems();
    const myGradingSystem = gradingSystems.find(
      (gs) => gs.id === this.gradingSystemId
    );
    if (myGradingSystem != null) {
      this.allGrades = myGradingSystem.grades;
    }
  }

  filterRoutesByGrade() {
    const ft = this.filteredTable;
    if (ft.navigating) {
      ft.navigating = false;
    } else {
      const newParams = { ...this.filters.value, ...this.gradeForm.value };
      newParams.publish = Object.keys(newParams.publish).filter(
        (key) => newParams.publish[key] === true
      );
      ft.setFilterParams(newParams);
    }
  }

  formatLabel(value: number, isMin: boolean = false): string {
    let myValue = value;
    if (!myValue && isMin) myValue = MIN_GRADE;
    if (!myValue && !isMin) myValue = MAX_GRADE;
    if (value === 350 || value === 250 || value === 150) myValue = value - 50;
    const grade = this.allGrades.find((grade) => grade.difficulty === myValue);

    if (grade != null) return grade.name;

    return `${myValue}`;
  }

  onCragSelected(selected: Crag) {
    if (selected && selected.__typename === 'Crag') {
      this.filters.patchValue({
        routeId: null,
        cragId: selected.id,
      });
      this.routeSearchEnabled = true;
    } else {
      this.filters.patchValue({
        cragId: null,
        routeId: null,
      });
      this.routeSearchEnabled = false;
    }
    this.cdr.detectChanges();
  }

  onRouteSelected(selected: Route) {
    if (selected && selected.__typename === 'Route') {
      this.filters.patchValue({
        routeId: selected.id,
      });
    } else {
      this.filters.patchValue({
        routeId: null,
      });
      this.routeSearchEnabled = false;
    }
    this.cdr.detectChanges();
  }

  toggleColumnSelection(): void {
    this.showColumnSelection = !this.showColumnSelection;
    this.showFilters = false;
  }

  get nrOfFiltersApplied(): number {
    return 0;
  }

  get ascentTypes() {
    if (this.filters.get('topRope').value) {
      return this.topRopeAscentTypes;
    } else {
      return this.nonTopRopeAscentTypes;
    }
  }

  toggleFilterSelection(): void {
    this.showFilters = !this.showFilters;
    this.showColumnSelection = false;
  }

  closeFilters() {
    this.showFilters = false;
  }

  toggleAscentTypeFilter(ascentTypeValue: string): void {
    const currentValues: string[] = this.filters.value.ascentType || [];
    if (currentValues.includes(ascentTypeValue)) {
      const newValues = currentValues.filter((v) => v != ascentTypeValue);
      this.filters.patchValue({ ascentType: newValues });
    } else {
      const newValues = [...currentValues, ascentTypeValue];
      this.filters.patchValue({ ascentType: newValues });
    }
  }

  isSelectedAscentTypeFilter(ascentTypeValue: string): boolean {
    const currentValues: string[] = this.filters.value.ascentType || [];
    return currentValues.includes(ascentTypeValue);
  }

  applyRelationFilterDisplayValues() {
    if (this.filters.value.cragId != null && !(this.forCrag != null)) {
      this.activityFiltersCragGQL
        .fetch({ id: this.filters.value.cragId })
        .pipe(take(1))
        .subscribe((crag) => {
          this.forCrag = crag.data.crag;
          this.routeSearchEnabled = true;
        });
    }

    if (!(this.filters.value.cragId != null)) {
      this.forCrag = null;
    }

    if (this.filters.value.routeId != null && !(this.forRoute != null)) {
      this.activityFiltersRouteGQL
        .fetch({ id: this.filters.value.routeId })
        .pipe(take(1))
        .subscribe((route) => (this.forRoute = route.data.route));
    }

    if (this.filters.value.routeId == null) {
      this.forRoute = null;
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  queryError(): void {
    this.error = {
      message: 'Prišlo je do nepričakovane napake pri zajemu podatkov.',
    };
  }

  querySuccess(data: MyActivityRoutesQuery['myActivityRoutes']): void {
    this.routes = data.items;
    this.pagination = data.meta;

    this.noTopropeOnPage = !this.routes.some((route) => {
      const index = this.ascentTypes.find(
        (at) => at.value === route.ascentType
      );
      if (index) {
        return index.topRope;
      } else return false;
    });
  }

  deleteActivityRoute(activityRoute: ActivityRoute) {
    this.authService.currentUser
      .pipe(
        concatMap((user) => {
          let finePrint = '';

          finePrint += ['redpoint', 'flash', 'onsight'].includes(
            activityRoute.ascentType
          )
            ? `Ker je to tvoj prvi uspešni vzpon v tej smeri, lahko pride do avtomatske spremembe tipa vzpona pri tvojih drugih vnosih za to smer.`
            : '';

          finePrint += ['t_redpoint', 't_flash', 't_onsight'].includes(
            activityRoute.ascentType
          )
            ? `Ker je to tvoj prvi uspešni toprope vzpon v tej smeri, lahko pride do avtomatske spremembe tipa vzpona pri tvojih drugih vnosih za to smer.`
            : '';

          finePrint += ['redpoint', 'flash', 'onsight'].includes(
            activityRoute.ascentType
          )
            ? `<br/>
            Če je to tvoj edini uspešni vzpon v tej smeri, boš s tem ${this.genderizeVerbPipe.transform(
              'pobrisal',
              user.gender
            )} tudi svoj morebitni glas o težavnosti te smeri.`
            : ``;

          finePrint += `<br/>
            Če je to tvoj edini vzpon v tej smeri, boš s tem ${this.genderizeVerbPipe.transform(
              'pobrisal',
              user.gender
            )} tudi svoj morebitni glas o lepoti te smeri.`;

          return this.dialog
            .open(ConfirmationDialogComponent, {
              data: {
                title: 'Brisanje vzpona',
                message: `Si ${this.genderizeVerbPipe.transform(
                  'prepričan',
                  user.gender
                )}, da želiš izbrisati ta vzpon?`,
                finePrint: finePrint,
              },
            })
            .afterClosed();
        }),
        filter((response) => response != null),
        switchMap(() =>
          this.deleteActivityRouteGQL.mutate(
            { id: activityRoute.id },
            {
              refetchQueries: [namedOperations.Query.MyActivityRoutes],
            }
          )
        )
      )
      .subscribe({
        next: () => {
          this.snackbar.open('Vzpon je bil uspešno izbrisan', null, {
            duration: 2000,
          });
        },
        error: () => {
          this.snackbar.open('Pri brisanju vzpona je prišlo do napake', null, {
            panelClass: 'error',
            duration: 3000,
          });
        },
      });
  }
}
