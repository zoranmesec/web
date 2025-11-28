import { AsyncPipe, DatePipe, formatDate } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { concatMap, filter, Subject, Subscription, switchMap } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { ACTIVITY_TYPES } from 'src/app/common/activity.constants';
import { ColumnDefinition } from 'src/app/common/filtered-table';
import { BreakpointService } from 'src/app/services/breakpoint.service';
import { LayoutService } from 'src/app/services/layout.service';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { LoaderComponent } from 'src/app/shared/components/loader/loader.component';
import { TitleComponent } from 'src/app/shared/components/title/title.component';
import { IconsModule } from 'src/app/shared/icons/icons.module';
import { ActivityColorPipe } from 'src/app/shared/pipes/activity-color.pipe';
import { ActivityLabelPipe } from 'src/app/shared/pipes/activity-label.pipe';
import { ActivityMaxDifficultyPipe } from 'src/app/shared/pipes/activity-max-difficulty.pipe';
import { ActivityTotalMetersPipe } from 'src/app/shared/pipes/activity-total-meters.pipe';
import { GenderizeVerbPipe } from 'src/app/shared/pipes/genderize-verb.pipe';
import { DataError } from 'src/app/types/data-error';
import {
    Activity,
    ActivityRoute,
    DeleteActivityGQL,
    DeleteActivityRouteGQL,
    MyActivitiesByMonthGQL,
    MyActivitiesByMonthQuery,
    namedOperations
} from 'src/generated/graphql';
import { ActivityHeaderComponent } from '../../partials/activity-header/activity-header.component';
import { ActivityRouteRowComponent } from '../../partials/activity-route-row/activity-route-row.component';
import { ActivityInputComponent } from '../activity-input/activity-input.component';

export interface RowAction {
    item: Activity | ActivityRoute;
    action: string;
}

@Component({
    selector: 'app-activity-log',
    templateUrl: './activity-log.component.html',
    styleUrls: ['./activity-log.component.scss'],
    imports: [
        MatSelectModule,
        FormsModule,
        ReactiveFormsModule,
        MatDatepickerModule,
        ActivityHeaderComponent,
        MatButtonModule,
        DatePipe,
        MatFormFieldModule,
        LoaderComponent,
        IconsModule,
        ActivityColorPipe,
        ActivityLabelPipe,
        ActivityTotalMetersPipe,
        ActivityMaxDifficultyPipe,
        AsyncPipe,
        MatDatepickerModule,
        MatInputModule,
        ActivityRouteRowComponent,
        RouterModule,
        MatMenuModule,
        TitleComponent
    ]
})
export class ActivityLogComponent implements OnInit, OnDestroy {
    error: DataError = null;

    loading = true;

    protected readonly locale = 'sl-SI';

    protected dateObject = new Date();

    protected days: any[] = Array(35);
    protected today = new Date();
    protected readonly formBuilder = inject(FormBuilder);
    protected readonly form = this.formBuilder.group({
        year: this.formBuilder.control(this.today.getFullYear(), {
            nonNullable: true
        }),
        month: this.formBuilder.control(this.months[this.today.getMonth()], {
            nonNullable: true
        }),
        day: this.formBuilder.control(null, { nonNullable: true }),
        date: this.formBuilder.control(new Date(), { nonNullable: true })
    });

    protected readonly tableColumns: ColumnDefinition[] = [
        { name: 'route', label: 'Smer' },
        { name: 'grade', label: 'Ocena', sortable: true },
        { name: 'ascentType', label: 'Vrsta vzpona' },
        { name: 'notes', label: 'Opombe' },
        { name: 'publish', label: 'Vidnost' }
    ];

    protected currentView: 'calendar' | 'list' = 'calendar';
    protected maxDate = new Date();
    rowAction$ = new Subject<RowAction>();

    activityTypes = ACTIVITY_TYPES;

    subscriptions: Subscription[] = [];
    activities: MyActivitiesByMonthQuery['myActivitiesByMonth'];
    title: string;
    constructor(
        private router: Router,
        private authService: AuthService,
        private dialog: MatDialog,
        private snackbar: MatSnackBar,
        private activatedRoute: ActivatedRoute,
        private layoutService: LayoutService,
        private myActivitiesByMonthGQL: MyActivitiesByMonthGQL,
        private deleteActivityGQL: DeleteActivityGQL,
        private deleteActivityRouteGQL: DeleteActivityRouteGQL,
        private genderizeVerbPipe: GenderizeVerbPipe,
        protected readonly breakpointService: BreakpointService,
        private changeDetectorRef: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.layoutService.$breadcrumbs.next([
            {
                name: 'Plezalni dnevnik'
            }
        ]);

        const routeParamsSub = this.activatedRoute.params.subscribe((params) => {
            this.loading = true;
            const year = params['year'] ? parseInt(params['year'], 10) : this.today.getFullYear();
            const month = params['month'] ? parseInt(params['month'], 10) : this.today.getMonth() + 1;

            const day = params['day'] ? parseInt(params['day'], 10) : null;
            if (day !== null) {
                this.currentView = 'list';

                this.title = this.capitalizeFirstLetter(formatDate(new Date(year, month - 1, day), 'EEEE, d. MMMM y', this.locale));

                this.layoutService.$breadcrumbs.next([
                    {
                        name: 'Plezalni dnevnik',
                        path: 'plezalni-dnevnik'
                    },
                    {
                        name: 'Koledar',
                        path: 'plezalni-dnevnik/dnevnik'
                    },
                    {
                        name: this.title
                    }
                ]);
            } else {
                this.currentView = 'calendar';
            }

            this.dateObject = new Date(year, month - 1, 1);
            this.form.patchValue({
                year: year,
                month: this.months[month - 1],
                day: day,
                date: new Date(year, month - 1, day ?? 1)
            });

            this.myActivitiesByMonthGQL
                .watch({
                    variables: {
                        month: month,
                        year: year
                    }
                })
                .valueChanges.subscribe((result) => {
                    if (result.error !== undefined) {
                        this.queryError();
                    } else if (result.data !== undefined) {
                        this.loading = false;
                        this.querySuccess(result.data.myActivitiesByMonth);
                        this.initializeDays();
                    }
                });
        });
        this.subscriptions.push(routeParamsSub);

        const actionsSub = this.rowAction$.subscribe((action) => {
            switch (action.action) {
                case 'editActivity':
                    this.editActivity(action.item as Activity);
                    break;
                case 'deleteActivity':
                    this.deleteActivity(action.item as Activity);
                    break;
                case 'delete':
                    this.deleteActivityRoute(action.item as ActivityRoute);
                    break;
            }
        });
        this.subscriptions.push(actionsSub);

        const formSub = this.form.valueChanges.subscribe((values) => {
            if (this.currentView === 'list') {
                const newDate = values.date as Date;
                this.router.navigate([
                    '/plezalni-dnevnik/dnevnik',
                    {
                        year: newDate.getFullYear(),
                        month: newDate.getMonth() + 1,
                        day: newDate.getDate()
                    }
                ]);
            } else {
                this.router.navigate([
                    '/plezalni-dnevnik/dnevnik',
                    {
                        year: values.year,
                        month: this.months.indexOf(values.month) + 1
                    }
                ]);
            }
        });

        this.subscriptions.push(formSub);
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((sub) => sub.unsubscribe());
    }

    queryError(): void {
        this.error = {
            message: 'Prišlo je do nepričakovane napake pri zajemu podatkov.'
        };
    }

    querySuccess(data): void {
        console.log('refetched!');
        this.activities = data;
        this.changeDetectorRef.markForCheck();
    }

    deleteActivityRoute(activityRoute: ActivityRoute) {
        this.authService.currentUser
            .pipe(
                concatMap((user) => {
                    let finePrint = '';

                    finePrint += ['redpoint', 'flash', 'onsight'].includes(activityRoute.ascentType)
                        ? `Ker je to tvoj prvi uspešni vzpon v tej smeri, lahko pride do avtomatske spremembe tipa vzpona pri tvojih drugih vnosih za to smer.`
                        : '';

                    finePrint += ['t_redpoint', 't_flash', 't_onsight'].includes(activityRoute.ascentType)
                        ? `Ker je to tvoj prvi uspešni toprope vzpon v tej smeri, lahko pride do avtomatske spremembe tipa vzpona pri tvojih drugih vnosih za to smer.`
                        : '';

                    finePrint += ['redpoint', 'flash', 'onsight'].includes(activityRoute.ascentType)
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
                                message: `Si ${this.genderizeVerbPipe.transform('prepričan', user.gender)}, da želiš izbrisati ta vzpon?`,
                                finePrint: finePrint
                            }
                        })
                        .afterClosed();
                }),
                filter((response) => response !== null),
                switchMap(() =>
                    this.deleteActivityRouteGQL.mutate({
                        variables: { id: activityRoute.id },
                        refetchQueries: [namedOperations.Query.MyActivitiesByMonth]
                    })
                )
            )
            .subscribe({
                next: () => {
                    this.snackbar.open('Vzpon je bil uspešno izbrisan', null, {
                        duration: 2000
                    });
                },
                error: () => {
                    this.snackbar.open('Pri brisanju vzpona je prišlo do napake', null, {
                        panelClass: 'error',
                        duration: 3000
                    });
                }
            });
    }

    private editActivity(activity: Activity) {
        this.dialog
            .open(ActivityInputComponent, {
                data: { activity: activity, crag: activity.crag },
                minWidth: this.breakpointService.ltMd ? '95vw' : '80vw',
                minHeight: this.breakpointService.ltMd ? '95vh' : '80vh'
            })
            .afterClosed()
            .subscribe(() => {
                console.log('Dialog closed');
            });
    }

    deleteActivity(activity: Activity) {
        this.authService.currentUser
            .pipe(
                concatMap((user) =>
                    this.dialog
                        .open(ConfirmationDialogComponent, {
                            data: {
                                title: 'Brisanje vnosa',
                                message: `Si ${this.genderizeVerbPipe.transform('prepričan', user.gender)}, da želiš izbrisati ta vnos?`,
                                finePrint:
                                    activity.type === 'crag' && activity.crag
                                        ? `Z brisanjem vnosa boš ${this.genderizeVerbPipe.transform(
                                              'pobrisal',
                                              user.gender
                                          )} tudi vse smeri v tem plezalnem dnevu.<br/>
                Če plezalni dan vsebuje vnos smeri, ki pomeni tvoj prvi uspešni vzpon v tej smeri, lahko pride do avtomatske spremembe tipa vzpona pri tvojih drugih vnosih za to smer.<br/>
                Če plezalni dan vsebuje vnos smeri, ki pomeni tvoj edini uspešni vzpon v tej smeri, boš s tem ${this.genderizeVerbPipe.transform(
                    'pobrisal',
                    user.gender
                )} tudi svoj glas o težavnosti te smeri in svojo oceno lepote te smeri.`
                                        : null
                            }
                        })
                        .afterClosed()
                ),
                filter((response) => response !== null),
                switchMap(() =>
                    this.deleteActivityGQL.mutate({
                        variables: { id: activity.id },
                        refetchQueries: [namedOperations.Query.MyActivitiesByMonth]
                    })
                )
            )
            .subscribe({
                next: () => {
                    this.snackbar.open('Vnos je bil uspešno izbrisan', null, {
                        duration: 2000
                    });
                },
                error: () => {
                    this.snackbar.open('Pri brisanju vnosa je prišlo do napake', null, {
                        panelClass: 'error',
                        duration: 3000
                    });
                }
            });
    }

    get tableColumnsAsObject(): Record<string, boolean> {
        const obj: Record<string, boolean> = {};
        this.tableColumns.forEach((col) => {
            obj[col.name] = true;
        });
        return obj;
    }

    get years(): number[] {
        const currentYear = new Date().getFullYear();
        const years: number[] = [];
        for (let year = currentYear - 5; year <= currentYear + 5; year++) {
            years.push(year);
        }
        return years;
    }

    get months(): string[] {
        if (this.breakpointService.ltMd) {
            return ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Avg', 'Sep', 'Okt', 'Nov', 'Dec'];
        } else {
            return [
                'Januar',
                'Februar',
                'Marec',
                'April',
                'Maj',
                'Junij',
                'Julij',
                'Avgust',
                'September',
                'Oktober',
                'November',
                'December'
            ];
        }
    }

    get activitiesForDay(): Activity[] {
        const dayControl = this.form.get('day') as FormControl;
        const yearControl = this.form.get('year') as FormControl;
        const monthControl = this.form.get('month') as FormControl;
        const selectedDay: Date = new Date(yearControl.value, this.months.indexOf(monthControl.value), dayControl.value);

        return this.activities.filter((activity) => {
            const activityDate = new Date(activity.date);
            return (
                activityDate.getDate() === selectedDay.getDate() &&
                activityDate.getMonth() === selectedDay.getMonth() &&
                activityDate.getFullYear() === selectedDay.getFullYear()
            );
        }) as Activity[];
    }

    protected addActivity(): void {
        this.dialog
            .open(ActivityInputComponent, {
                data: {},
                minWidth: this.breakpointService.ltMd ? '95vw' : '80vw',
                minHeight: this.breakpointService.ltMd ? '95vh' : '80vh',
                width: this.breakpointService.ltMd ? '95vw' : '80vw',
                height: this.breakpointService.ltMd ? '95vh' : '80vh'
            })
            .afterClosed()
            .subscribe((_result) => {
                this.dialog.closeAll();
            });
    }

    protected increaseMonth(): void {
        if (this.dateObject.getMonth() === 11) {
            this.form.patchValue({ year: this.dateObject.getFullYear() + 1 });
        }
        this.form.patchValue({
            month: this.months[(this.dateObject.getMonth() + 1) % 12]
        });
    }

    protected decreaseMonth(): void {
        if (this.dateObject.getMonth() === 0) {
            this.form.patchValue({ year: this.dateObject.getFullYear() - 1 });
        }
        this.form.patchValue({
            month: this.months[(this.dateObject.getMonth() - 1 + 12) % 12]
        });
    }

    protected increaseDay(): void {
        {
            const dateControl = this.form.get('date') as FormControl;
            const selectedDay: Date = dateControl.value as Date;
            selectedDay.setDate(selectedDay.getDate() + 1);
            this.form.patchValue({
                year: selectedDay.getFullYear(),
                month: this.months[selectedDay.getMonth()],
                day: selectedDay.getDate()
            });
        }
    }

    protected decreaseDay(): void {
        const dateControl = this.form.get('date') as FormControl;
        const selectedDay: Date = dateControl.value as Date;
        selectedDay.setDate(selectedDay.getDate() - 1);
        this.form.patchValue({
            year: selectedDay.getFullYear(),
            month: this.months[selectedDay.getMonth()],
            day: selectedDay.getDate()
        });
    }

    protected showCalendar(): void {
        const year = this.form.get('year').value;
        const month = this.months.indexOf(this.form.get('month').value) + 1;

        this.router.navigate([
            '/plezalni-dnevnik/dnevnik',
            {
                year: year,
                month: month
            }
        ]);
    }

    protected goToToday(): void {
        // if same day do nothing
        const today = new Date();
        const year = this.form.get('year').value;
        const month = this.months.indexOf(this.form.get('month').value);
        const day = this.form.get('day').value;
        if (today.getFullYear() === year && today.getMonth() === month && today.getDate() === day) {
            return;
        }

        this.form.reset();
    }

    protected openDay(day): void {
        const selectedDate: Date = day.day;
        this.router.navigate([
            '/plezalni-dnevnik/dnevnik',
            {
                year: selectedDate.getFullYear(),
                month: selectedDate.getMonth() + 1,
                day: selectedDate.getDate()
            }
        ]);
    }

    private initializeDays(): void {
        const today = this.dateObject;
        let date = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        const monthIndex = date.getMonth();
        const year = date.getFullYear();
        date = new Date(year, monthIndex + 1, 0);

        const numberOfDays = date.getDate();
        date = new Date(year, monthIndex, 1);
        let firstDayIndex = date.getDay() - 1;
        if (firstDayIndex < 0) {
            firstDayIndex = 7 + firstDayIndex;
        } else if (firstDayIndex === 0) {
            firstDayIndex = 7;
        }
        for (let i = 0; i < 42; i++) {
            if (i >= firstDayIndex && i < numberOfDays + firstDayIndex) {
                this.days[i] = {
                    day: new Date(year, monthIndex, i - firstDayIndex + 1),
                    activities: this.activities.filter((activity) => {
                        const activityDate = new Date(activity.date);
                        return (
                            activityDate.getDate() === i - firstDayIndex + 1 &&
                            activityDate.getMonth() === monthIndex &&
                            activityDate.getFullYear() === year
                        );
                    }),
                    isToday: this.calculateIsToday(i - firstDayIndex + 1, monthIndex, year),
                    isWithinThisMonth: true
                };
            } else if (i < firstDayIndex) {
                this.days[i] = {
                    day: new Date(year, monthIndex, i - firstDayIndex + 1),
                    activities: this.activities.filter((activity) => {
                        const activityDate = new Date(activity.date);
                        const prevMonthIndex = monthIndex - 1 < 0 ? 11 : monthIndex - 1;
                        const prevYear = monthIndex - 1 < 0 ? year - 1 : year;
                        const daysInPrevMonth = new Date(prevYear, prevMonthIndex + 1, 0).getDate();
                        return (
                            activityDate.getDate() === daysInPrevMonth + (i - firstDayIndex + 1) &&
                            activityDate.getMonth() === prevMonthIndex &&
                            activityDate.getFullYear() === prevYear
                        );
                    }),
                    isWithinThisMonth: false
                };
            } else {
                this.days[i] = {
                    day: new Date(year, monthIndex, i - firstDayIndex + 1),
                    activities: this.activities.filter((activity) => {
                        const activityDate = new Date(activity.date);
                        const nextMonthIndex = monthIndex + 1 > 11 ? 0 : monthIndex + 1;
                        const nextYear = monthIndex + 1 > 11 ? year + 1 : year;
                        return (
                            activityDate.getDate() === i - firstDayIndex + 1 - numberOfDays &&
                            activityDate.getMonth() === nextMonthIndex &&
                            activityDate.getFullYear() === nextYear
                        );
                    }),
                    isWithinThisMonth: false
                };
            }
        }
    }

    private calculateIsToday(day: number, month: number, year: number): boolean {
        const today = new Date();
        return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
    }

    private capitalizeFirstLetter(str: string): string {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}
