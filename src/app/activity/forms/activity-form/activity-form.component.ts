import { Platform } from '@angular/cdk/platform';
import { DatePipe } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule, MatDatepickerToggle } from '@angular/material/datepicker';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Apollo } from 'apollo-angular';
import dayjs from 'dayjs';
import { concatMap, EMPTY, map, Observer, of, Subscription, switchMap } from 'rxjs';
import { CustomDateAdapter } from 'src/app/app.component';
import { ACTIVITY_TYPES } from 'src/app/common/activity.constants';
import { ActivitySelectionData } from 'src/app/pages/crag/crag-routes/crag-routes.component';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { IconsModule } from 'src/app/shared/icons/icons.module';
import { GradingSystemsService } from 'src/app/shared/services/grading-systems.service';
import {
    Activity,
    ActivityEntryGQL,
    Crag,
    CreateActivityGQL,
    CreateActivityMutation,
    DryRunCreateActivityGQL,
    DryRunUpdateActivityGQL,
    IceFall,
    MyActivitiesGQL,
    namedOperations,
    Peak,
    Route,
    RoutesTouchesGQL,
    StarRatingVotesGQL,
    UpdateActivityGQL,
    UpdateActivityMutation,
    UpdateActivityRouteInput
} from 'src/generated/graphql';
import { ActivityFormRouteComponent } from './activity-form-route/activity-form-route.component';
import { ActivityFormService } from './activity-form.service';
import { DryRunActivityDialogComponent } from './dry-run-activity-dialog/dry-run-activity-dialog.component';

@Component({
    selector: 'app-activity-form',
    templateUrl: './activity-form.component.html',
    styleUrls: ['./activity-form.component.scss'],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatLabel,
        MatFormFieldModule,
        MatDatepickerToggle,
        MatDatepickerModule,
        MatNativeDateModule,
        MatSelectModule,
        MatInputModule,
        ActivityFormRouteComponent,
        MatButtonModule,
        MatDialogModule,
        MatExpansionModule,
        IconsModule,
        DatePipe
    ],
    providers: [
        {
            provide: MAT_DATE_FORMATS,
            useValue: {
                parse: {
                    dateInput: 'DD.MM.YYYY'
                },
                display: {
                    dateInput: 'DD.MM.YYYY',
                    monthYearLabel: 'MMM YYYY',
                    dateA11yLabel: 'LL',
                    monthYearA11yLabel: 'MMMM YYYY'
                }
            }
        },
        DatePipe,
        { provide: MAT_DATE_LOCALE, useValue: 'sl-SI' },
        {
            provide: DateAdapter,
            useClass: CustomDateAdapter,
            deps: [MAT_DATE_LOCALE, Platform]
        }
    ]
})
export class ActivityFormComponent implements OnInit, OnDestroy {
    @Input() selectedRoutes: Route[];
    @Input() crag?: Crag;
    @Input() peak?: Peak;
    @Input() iceFall?: IceFall;

    @Input() activity: Activity;

    // new - no activity yet, edit - edit activity fields but add no routes, add - add routes to existing activity
    @Input() formType: 'new' | 'edit' | 'add' = 'new';

    @Output() saveActivity = new EventEmitter<boolean>();

    maxDate = new Date();

    loading = false;
    loadingActivity = false;

    typeOptions = ACTIVITY_TYPES.filter((a) => a.value !== 'peak' && a.value !== 'iceFall');

    fb: FormBuilder = inject(FormBuilder);
    routes = new FormArray<FormGroup>([]);

    activityForm = this.fb.group({
        type: this.fb.control(null, Validators.required),
        name: this.fb.control(''),
        cragId: this.fb.control(null),
        peakId: this.fb.control(null),
        iceFallId: this.fb.control(null),
        duration: this.fb.control(null),
        date: this.fb.control(null),
        partners: this.fb.control(''),
        notes: this.fb.control(''),
        routes: this.routes
    });

    subscriptions: Subscription[] = [];
    private readonly datePipe = inject(DatePipe);

    constructor(
        private snackBar: MatSnackBar,
        private dialog: MatDialog,
        private createActivityGQL: CreateActivityGQL,
        private updateActivityGQL: UpdateActivityGQL,
        private dryRunCreateActivityGQL: DryRunCreateActivityGQL,
        private dryRunUpdateActivityGQL: DryRunUpdateActivityGQL,
        private localStorageService: LocalStorageService<ActivitySelectionData>,
        private activityFormService: ActivityFormService,
        private myActivitiesGQL: MyActivitiesGQL,
        private activityEntryGQL: ActivityEntryGQL,
        private routesTouchesGQL: RoutesTouchesGQL,
        private starRatingVotesGQL: StarRatingVotesGQL,
        private gradingSystemService: GradingSystemsService
    ) {}

    async ngOnInit(): Promise<void> {
        if (this.formType === 'edit') {
            this.activityForm.controls.date.disable();
        }

        this.activityForm.controls.date.valueChanges
            .pipe(
                switchMap((date) => {
                    const dt = date as Date;
                    // Disable all ascentType inputs, until we get users route touches before the newly selected date
                    this.routes.controls.forEach((routeFormGroup) => routeFormGroup.get('ascentType').disable({ emitEvent: false }));

                    this.patchRouteDates(date); // TODO: do we need to do this? logging routes with different dates is not possible anymore, so we can have only one date now!

                    const routeIds = new Set(this.routes.controls.map((routeFormGroup) => routeFormGroup.get('routeId').value));
                    if (routeIds.size > 0) {
                        return this.routesTouchesGQL.fetch({
                            variables: {
                                input: {
                                    routeIds: [...routeIds],
                                    activityId: this.activity?.id,
                                    before: this.datePipe.transform(dt, 'yyyy-MM-dd')
                                }
                            }
                        });
                    }
                })
            )
            .subscribe((result) => {
                const { ticked, tried, trTicked } = result.data.routesTouches;
                const tickedRoutes = new Set(ticked.map((ar) => ar.routeId));
                const triedRoutes = new Set(tried.map((ar) => ar.routeId));
                const trTickedRoutes = new Set(trTicked.map((ar) => ar.routeId));

                this.routes.controls.forEach((route) => {
                    const routeId = route.get('routeId').value;

                    const routeTicked = tickedRoutes.has(routeId);
                    route.get('ticked').setValue(routeTicked);

                    const routeTried = triedRoutes.has(routeId);
                    route.get('tried').setValue(routeTried);

                    const routeTrTicked = trTickedRoutes.has(routeId);
                    route.get('trTicked').setValue(routeTrTicked);

                    // If not already set, set default value for ascentType based on user's log history (might get changed rihgt away with revalidateAT, but it's a good first guess anyway)
                    if (!route.get('ascentType').value) {
                        route.patchValue(
                            {
                                ascentType: routeTicked ? 'repeat' : 'redpoint'
                            },
                            { emitEvent: false }
                        );
                    }
                });

                this.activityFormService.revalidateAscentTypes();
                this.activityFormService.conditionallyDisableVotedDifficultyInputs();
                this.activityFormService.conditionallyDisableVotedStarRatingInputs();

                // Now that user's ascent history has been fetched and ascentTypes revalidated, we can reenable ascentType controls
                this.routes.controls.forEach((routeFormGroup) => {
                    routeFormGroup.get('ascentType').enable();
                    // routeFormGroup.get('ascentType').enable({ emitEvent: false }); // TODO: this would be the better way, but seems that material needs event emitted in order to update the display of the field (does work if no material)
                });
            });

        if (this.activity !== undefined && this.activity.routes !== undefined) {
            await Promise.all(
                this.activity.routes.map((activityRoute) =>
                    this.addRoute(
                        activityRoute.route,
                        activityRoute.notes,
                        activityRoute.publish,
                        0,
                        activityRoute.ascentType,
                        activityRoute.id
                    )
                )
            );
        }

        if (this.selectedRoutes !== null) {
            await Promise.all(this.selectedRoutes.map((route) => this.addRoute(route)));
        }

        // Fetch user's previous star rating votes, and display them below the star rating inputs
        if (this.selectedRoutes?.length) {
            this.starRatingVotesGQL
                .fetch({
                    variables: { routeIds: this.selectedRoutes.map((route) => route.id) }
                })
                .subscribe({
                    next: (response) => {
                        const starRatingVotesForRoutes: Record<string, number> = {};
                        response.data.starRatingVotes.forEach((vote) => {
                            starRatingVotesForRoutes[vote.route.id] = vote.stars;
                        });

                        // store it in a service, to be accessed in the form-route component
                        this.activityFormService.starRatingVotesForRoutes = starRatingVotesForRoutes;
                    }
                });
        }

        if (this.activity) {
            this.activityForm.patchValue({
                date: this.activity.date,
                notes: this.activity.notes,
                partners: this.activity.partners,
                duration: this.activity.duration,
                name: this.activity.name,
                type: this.activity.type
            });
        } else {
            this.activityForm.patchValue({
                date: new Date(),
                notes: '',
                partners: '',
                duration: null,
                name: '',
                type: null,
                routes: []
            });
        }

        if (this.crag !== null && this.formType !== 'edit') {
            this.watchForOverlappingActivity();
        }

        if (this.activity === undefined) {
            this.activityForm.patchValue({
                type: this.getInitialType()
            });
        }

        if (this.crag !== undefined) {
            this.activityForm.patchValue({
                name: this.crag.name,
                cragId: this.crag.id
            });
        }

        if (this.formType !== 'new' && this.crag !== undefined) {
            this.activityForm.controls.type.disable();
        }
        this.activityFormService.initialize(this.routes);
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((sub) => sub.unsubscribe());
    }

    getInitialType() {
        if (this.crag !== null) return 'crag';
        if (this.peak !== null) return 'peak';
        if (this.iceFall !== null) return 'iceFall';
        return null;
    }

    watchForOverlappingActivity() {
        this.activityForm.controls.date.valueChanges
            .pipe(
                switchMap((date) => {
                    this.loadingActivity = true;
                    return this.myActivitiesGQL.fetch({
                        variables: {
                            input: {
                                dateFrom: dayjs(date).format('YYYY-MM-DD'),
                                dateTo: dayjs(date).format('YYYY-MM-DD'),
                                cragId: this.crag.id
                            }
                        }
                    });
                }),
                map((response) => response.data.myActivities.items[0] ?? null),
                switchMap((activity) => (activity !== null ? this.activityEntryGQL.fetch({ variables: { id: activity.id } }) : of(null))),
                map((response) => (response ? response.data.activity : null))
            )
            .subscribe((activity) => {
                this.loadingActivity = false;

                if (activity === null && this.activity !== null) {
                    this.activityForm.patchValue({
                        notes: null,
                        partners: null
                    });
                }
                if (activity === null) {
                    this.activity = null;
                    this.formType = 'new';
                    return;
                }

                this.activity = activity as Activity;
                this.activityForm.patchValue({
                    notes: activity.notes,
                    partners: activity.partners
                });

                this.formType = this.routes.length === 0 ? 'edit' : 'add';
            });
    }

    patchRouteDates(value: Date): void {
        this.routes.controls.forEach((control) => control.patchValue({ date: value }));
    }

    async addRoute(
        route: Route,
        notes = '',
        publish = 'public',
        starRating = 0,
        ascentType: string = null,
        activityId?: string
    ): Promise<void> {
        const gradeDiff = await this.gradingSystemService.diffToGrade(route.difficulty, route.defaultGradingSystem.id);

        this.routes.push(
            this.fb.group({
                activityId: this.fb.control(activityId || null),
                routeId: this.fb.control(route.id),
                name: this.fb.control(route.name),
                slug: this.fb.control(route.slug),
                difficulty: this.fb.control(route.difficulty),
                defaultGradingSystemId: this.fb.control(route.defaultGradingSystem.id),
                isProject: this.fb.control(route.isProject),
                ascentType: this.fb.control({ value: ascentType, disabled: true }, [Validators.required]),
                topRope: this.fb.control({ value: false, disabled: false }),
                date: this.fb.control(dayjs(this.activityForm.controls.date.value)),
                publish: this.fb.control(publish),
                notes: this.fb.control(notes),
                votedStarRating: this.fb.control(starRating),
                votedDifficulty: this.fb.control(
                    {
                        value: gradeDiff.difficulty,
                        disabled: false
                    },
                    { nonNullable: true }
                ),
                gradeLabel: this.fb.control(gradeDiff.name),
                ticked: this.fb.control(0),
                tried: this.fb.control(0),
                trTicked: this.fb.control(0),
                type: this.fb.control(route.routeType.id)
            })
        );
    }

    save(): void {
        const data = this.activityForm.getRawValue();
        this.activityForm.disable({ emitEvent: false });
        const routes = this.routes.value.map((route, i: number) => {
            if (this.activity !== undefined && route.activityId !== null) {
                return {
                    id: route.activityId,
                    date: dayjs(data.date).format('YYYY-MM-DD'), // TODO enforce this on backend
                    partner: route.partner || data.partners,
                    notes: route.notes,
                    routeId: route.routeId,
                    ascentType: route.ascentType,
                    votedStarRating: Number.parseFloat(route.votedStarRating),
                    publish: route.publish,
                    votedDifficulty: route.votedDifficulty,
                    position: i // position of the route within the same activity of ones log
                };
            } else {
                return {
                    date: dayjs(data.date).format('YYYY-MM-DD'), // TODO enforce this on backend
                    partner: route.partner || data.partners,
                    notes: route.notes,
                    routeId: route.routeId,
                    ascentType: route.ascentType,
                    votedStarRating: Number.parseFloat(route.votedStarRating),
                    publish: route.publish,
                    votedDifficulty: route.votedDifficulty,
                    position: i // position of the route within the same activity of ones log
                };
            }
        }) as UpdateActivityRouteInput[];

        const activityInput = {
            date: dayjs(data.date).format('YYYY-MM-DD'), // TODO backend make sure that this did not change in case it has logged routes
            duration: data.duration,
            name: data.name,
            notes: data.notes,
            partners: data.partners
        };

        // We have 3 possible cases here:
        // 1: edit  -> we are updating the activity data only (no routes changes) -> no dry run is needed
        // 2: add   -> we are adding routes to existing activity -> do dry run
        // 3: new   -> we are creating a new activity -> do dry run

        // Before actually saving (mutating) the log, do a dry run and get back the ascent type changes that the log might trigger
        // If any, show them to the user, and only after another confirmation, do the actual mutation

        try {
            switch (this.formType) {
                case 'edit':
                    {
                        const editActivityInput = {
                            ...activityInput,
                            id: this.activity.id
                        };
                        this.dryRunUpdateActivityGQL
                            .fetch({ variables: { input: editActivityInput, routes } })
                            .pipe(
                                concatMap((result) => {
                                    if (result.data) {
                                        if (result.data.dryRunUpdateActivity.length) {
                                            // If we got back some data, there will be changes in 'future' logs, so user needs to preview and confirm them
                                            const dryRunSideEffects = result.data.dryRunUpdateActivity;
                                            return this.dialog
                                                .open(DryRunActivityDialogComponent, {
                                                    data: { dryRunSideEffects }
                                                })
                                                .afterClosed();
                                        } else {
                                            return of(true); // If no data from dryRun, then emit true and complete as if the dialog was opened and confirmed
                                        }
                                    }
                                }),
                                concatMap((confirmed) => {
                                    if (confirmed) {
                                        // User confirmed autocorrect changes, so do the actual mutation now
                                        this.loading = true;
                                        const refetchQueries = [];
                                        if (this.activity !== undefined) {
                                            refetchQueries.push(namedOperations.Query.MyActivitiesByMonth);
                                            refetchQueries.push(namedOperations.Query.MyActivityRoutes);
                                        } else {
                                            refetchQueries.push(namedOperations.Query.MyCragSummary);
                                        }

                                        return this.updateActivityGQL.mutate({
                                            variables: { input: editActivityInput, routes },
                                            refetchQueries: refetchQueries
                                        });
                                    } else {
                                        // User declined. Nothing to do. Make form active again and complete.
                                        this.activityForm.enable({ emitEvent: false });
                                        this.loading = false;
                                        return EMPTY; // just completes
                                    }
                                })
                            )
                            .subscribe(this.getActivityMutationObserver());
                    }
                    break;

                case 'add':
                    {
                        const addToActivityInput = {
                            ...activityInput,
                            id: this.activity.id
                        };
                        console.log('Doing dry run update activity for adding routes:', addToActivityInput, routes);
                        this.dryRunUpdateActivityGQL
                            .fetch({ variables: { input: addToActivityInput, routes } })
                            .pipe(
                                concatMap((result) => {
                                    if (result.data) {
                                        if (result.data.dryRunUpdateActivity.length) {
                                            // If we got back some data, there will be changes in 'future' logs, so user needs to preview and confirm them
                                            const dryRunSideEffects = result.data.dryRunUpdateActivity;
                                            return this.dialog
                                                .open(DryRunActivityDialogComponent, {
                                                    data: { dryRunSideEffects }
                                                })
                                                .afterClosed();
                                        } else {
                                            return of(true); // If no data from dryRun, theb emit true and complete as if the dialog was opened and confirmed
                                        }
                                    }
                                }),
                                concatMap((confirmed) => {
                                    if (confirmed) {
                                        // User confirmed autocorrect changes, so do the actual mutation now
                                        this.loading = true;

                                        return this.updateActivityGQL.mutate({
                                            variables: { input: addToActivityInput, routes },
                                            refetchQueries: [
                                                namedOperations.Query.MyActivitiesByMonth,
                                                namedOperations.Query.MyActivityRoutes
                                            ]
                                        });
                                    } else {
                                        // User declined. Nothing to do. Make form active again and complete.
                                        this.activityForm.enable({ emitEvent: false });
                                        this.loading = false;
                                        return EMPTY; // just completes
                                    }
                                })
                            )
                            .subscribe(this.getActivityMutationObserver());
                    }
                    break;

                case 'new': {
                    const createActivityInput = {
                        ...activityInput,
                        type: data.type,
                        cragId: data.cragId,
                        peakId: data.peakId,
                        iceFallId: data.iceFallId
                    };
                    this.dryRunCreateActivityGQL
                        .fetch({ variables: { input: createActivityInput, routes } })
                        .pipe(
                            concatMap((result) => {
                                if (result.data) {
                                    if (result.data.dryRunCreateActivity.length) {
                                        // If we got back some data, there will be changes in 'future' logs, so user needs to preview and confirm them
                                        const dryRunSideEffects = result.data.dryRunCreateActivity;
                                        return this.dialog
                                            .open(DryRunActivityDialogComponent, {
                                                data: { dryRunSideEffects }
                                            })
                                            .afterClosed();
                                    } else {
                                        return of(true); // If no data from dryRun, theb emit true and complete as if the dialog was opened and confirmed
                                    }
                                }
                            }),
                            concatMap((confirmed) => {
                                if (confirmed) {
                                    // User confirmed autocorrect changes, so do the actual mutation now
                                    this.loading = true;
                                    const refetchQueries = [];
                                    if (this.activity !== undefined) {
                                        refetchQueries.push(namedOperations.Query.MyActivitiesByMonth);
                                        refetchQueries.push(namedOperations.Query.MyActivityRoutes);
                                    } else {
                                        refetchQueries.push(namedOperations.Query.MyCragSummary);
                                    }

                                    return this.createActivityGQL.mutate({
                                        variables: { input: createActivityInput, routes },
                                        refetchQueries: refetchQueries
                                    });
                                } else {
                                    // User declined. Nothing to do. Make form active again and complete.
                                    this.activityForm.enable({ emitEvent: false });
                                    this.loading = false;
                                    return EMPTY; // just completes
                                }
                            })
                        )
                        .subscribe(this.getActivityMutationObserver());
                }
            }
        } catch (error) {
            console.error('Error saving activity:', error);
        }
    }

    private getActivityMutationObserver(): Observer<
        Apollo.MutateResult<UpdateActivityMutation> | Apollo.MutateResult<CreateActivityMutation>
    > {
        return {
            next: () => {
                if (this.crag !== undefined) {
                    this.localStorageService.removeItem('activity-selection');

                    if (this.formType === 'new') {
                        this.successCragWithRoutes();
                        return;
                    }
                }
                this.snackBar.open(
                    this.formType === 'edit' ? 'Vnos v plezalnem dnevniku je bil posodobljen' : 'Vnos je bil shranjen v plezalni dnevnik',
                    null,
                    {
                        duration: 3000
                    }
                );
                this.saveActivity.emit(true);
            },
            error: (error) => {
                console.error('Error saving activity:', error);
                this.loading = false;
                this.activityForm.enable();
                // this.snackBar.open('Vnosa ni bilo mogoče shraniti', null, {
                //     panelClass: 'error',
                //     duration: 3000
                // });
            },
            complete: () => {
                this.loading = false;
                this.activityForm.enable();
            }
        };
    }

    successCragWithRoutes() {
        this.localStorageService.removeItem('activity-selection');

        this.saveActivity.emit(true);
    }
}
