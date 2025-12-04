import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { User } from '@sentry/angular';
import { Apollo } from 'apollo-angular';
import { combineLatest, filter, Subscription, switchMap, take } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { TitleComponent } from 'src/app/shared/components/title/title.component';
import { IconsModule } from 'src/app/shared/icons/icons.module';
import {
    Crag,
    ManagementDeleteRouteGQL,
    ManagementDeleteRoutesGQL,
    ManagementGetSectorGQL,
    ManagementSaveRoutePositionGQL,
    namedOperations,
    Route,
    Sector
} from '../../../../generated/graphql';
import { LayoutService } from '../../../services/layout.service';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { MergeRouteFormComponent } from '../../forms/merge-route-form/merge-route-form.component';
import { MoveRouteFormComponent } from '../../forms/move-route-form/move-route-form.component';
import { RouteFormComponent, RouteFormValues } from '../../forms/route-form/route-form.component';
import { CragAdminBreadcrumbs } from '../../utils/crag-admin-breadcrumbs';
import { ContributionService } from '../contributions/contribution/contribution.service';
import { RouteContainerComponent } from './route-container/route-container.component';

@Component({
    selector: 'app-crag-sector-routes',
    templateUrl: './crag-sector-routes.component.html',
    styleUrls: ['./crag-sector-routes.component.scss'],
    standalone: true,
    imports: [
        CdkDropList,
        CdkDrag,
        MatMenuModule,
        IconsModule,
        MatButtonModule,
        RouterModule,
        TitleComponent,
        RouteContainerComponent,
        MatCheckboxModule,
        ReactiveFormsModule,
        FormsModule,
        MatInputModule,
        MatTooltipModule
    ]
})
export class CragSectorRoutesComponent implements OnInit, OnDestroy {
    loading = true;
    savingPositions = false;
    heading = '';

    crag: Crag;
    sector: Sector;
    routes: Route[];

    subscriptions: Subscription[] = [];

    user: User;
    fullAccess = false;

    // inject form builder
    private formBuilder = inject(FormBuilder);
    protected routesForm = this.formBuilder.group({
        selectAll: this.formBuilder.control<boolean>(false),
        selectedRouteIds: this.formBuilder.control<string[]>([])
    });

    constructor(
        private snackBar: MatSnackBar,
        private dialog: MatDialog,
        private authService: AuthService,
        private activatedRoute: ActivatedRoute,
        private layoutService: LayoutService,
        private sectorGQL: ManagementGetSectorGQL,
        private savePositionGQL: ManagementSaveRoutePositionGQL,
        private deleteRouteGQL: ManagementDeleteRouteGQL,
        private deleteRoutesGQL: ManagementDeleteRoutesGQL,
        private apollo: Apollo,
        public contributionService: ContributionService
    ) {}

    ngOnInit(): void {
        const sub = combineLatest([
            this.activatedRoute.params.pipe(
                filter((params) => params.sector !== null),
                switchMap(
                    (params) =>
                        this.sectorGQL.watch({
                            variables: { id: params.sector }
                        }).valueChanges
                )
            ),
            this.authService.currentUser.asObservable()
        ]).subscribe(([result, user]) => {
            if (result.data !== undefined) {
                this.loading = false;

                this.sector = result.data.sector as Sector;
                this.crag = this.sector.crag as Crag;

                this.routes = [...(result.data.sector.routes as Route[])];

                if (this.sector.label !== '') {
                    this.heading = `Urejanje smeri v sektorju ${this.sector.label} - ${this.sector.name}, ${this.crag.name}`;
                } else {
                    this.heading = `Urejanje smeri v plezališču ${this.crag.name}`;
                }

                this.layoutService.$breadcrumbs.next(new CragAdminBreadcrumbs(this.crag).build());

                this.user = user;
            }
        });
        this.subscriptions.push(sub);

        const selectAllSub = this.routesForm.controls.selectAll.valueChanges.subscribe((selectAll) => {
            if (selectAll) {
                const allIds = this.routes.map((route) => route.id);
                this.routesForm.controls.selectedRouteIds.setValue(allIds);
            } else {
                this.routesForm.controls.selectedRouteIds.setValue([]);
            }
        });

        const selectedRouteIdsSub = this.routesForm.controls.selectedRouteIds.valueChanges.subscribe((selectedRouteIds) => {
            const allSelected = selectedRouteIds.length === this.routes.length;
            if (this.routesForm.controls.selectAll.value !== allSelected) {
                this.routesForm.controls.selectAll.setValue(allSelected, { emitEvent: false });
            }
        });
        this.subscriptions.push(selectedRouteIdsSub);

        this.subscriptions.push(selectAllSub);
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((sub) => sub.unsubscribe());
    }

    // A route can be edited by admin (always) or by a user if it's his contribution and still in status draft
    canEdit(route: Route): boolean {
        return this.user.roles.includes('admin') || route.publishStatus === 'draft';
    }

    drop(event: CdkDragDrop<string[]>) {
        if (event.previousIndex === event.currentIndex) return;

        const data = {
            id: this.routes[event.previousIndex].id,
            position:
                event.currentIndex > event.previousIndex
                    ? this.routes[event.currentIndex].position + 1
                    : this.routes[event.currentIndex].position
        };

        // move in FE to see changes even before BE responds
        moveItemInArray(this.routes, event.previousIndex, event.currentIndex);

        this.savingPositions = true;

        this.savePositionGQL.mutate({ variables: { input: data }, fetchPolicy: 'no-cache' }).subscribe(() => {
            this.apollo.client.resetStore().then(() => {
                this.savingPositions = false;
                this.snackBar.open('Vrstni red smeri je bil shranjen', null, {
                    duration: 2000
                });
            });
        });
    }

    add(values: RouteFormValues = {}): void {
        if (values.defaultGradingSystemId === null) {
            values.defaultGradingSystemId = this.crag.defaultGradingSystem.id;
        }
        this.dialog
            .open(RouteFormComponent, {
                data: {
                    values: {
                        ...values,
                        position:
                            values.position !== null
                                ? values.position
                                : this.routes.length === 0
                                  ? 1
                                  : this.routes[this.routes.length - 1].position + 1,
                        sectorId: this.sector.id
                    }
                }
            })
            .afterClosed()
            .pipe(
                take(1),
                filter((values?: RouteFormValues) => values && values.addAnother)
            )
            .subscribe((values: RouteFormValues) => this.add(values));
    }

    edit(route: Route): void {
        this.dialog.open(RouteFormComponent, { data: { route: route } });
    }

    moveToSector(route: Route): void {
        this.dialog.open(MoveRouteFormComponent, {
            data: { route: route, crag: this.crag }
        });
    }

    mergeRoutes(): void {
        this.dialog.open(MergeRouteFormComponent, {
            data: {
                primaryRoute: this.routes.find((r) => r.id === this.routesForm.controls.selectedRouteIds.value[0]),
                secondaryRoute: this.routes.find((r) => r.id === this.routesForm.controls.selectedRouteIds.value[1]),
                sector: this.sector
            }
        });
    }

    remove(sector: Sector): void {
        this.dialog
            .open(ConfirmationDialogComponent, {
                data: {
                    message: 'Si prepričan/a, da želiš izbrisati to smer?',
                    title: 'Izbris smeri'
                }
            })
            .afterClosed()
            .pipe(
                take(1),
                filter((value) => value !== null),
                switchMap(() => this.deleteRouteGQL.mutate({ variables: { id: sector.id } }))
            )
            .subscribe({
                next: () => {
                    this.apollo.client.resetStore().then(() => {
                        this.snackBar.open('Smer je bila izbrisana', null, {
                            duration: 2000
                        });
                    });
                },
                error: (error) => {
                    if (error.message === 'route_has_log_entries') {
                        error.message = 'Smeri ni mogoče izbrisati, ker ima zabeležene vzpone.';
                    }
                    this.snackBar.open(error.message, null, {
                        panelClass: 'error',
                        duration: 3000
                    });
                }
            });
    }

    deleteSelectedRoutes(): void {
        const selectedRouteIds = this.routesForm.controls.selectedRouteIds.value;
        if (selectedRouteIds.length === 0) {
            return;
        }

        this.dialog
            .open(ConfirmationDialogComponent, {
                data: {
                    message: `Si prepričan/a, da želiš izbrisati izbrane smeri?`,
                    title: 'Izbris izbranih smeri'
                }
            })
            .afterClosed()
            .pipe(
                take(1),
                filter((value) => value !== null || value !== undefined),
                switchMap(() =>
                    this.deleteRoutesGQL.mutate({
                        variables: { input: selectedRouteIds },
                        refetchQueries: [namedOperations.Query.ManagementGetSector]
                    })
                )
            )
            .subscribe({
                next: () => {
                    this.apollo.client.resetStore().then(() => {
                        this.snackBar.open('Izbrane smeri so bile izbrisane', null, {
                            duration: 2000
                        });
                        this.routesForm.controls.selectedRouteIds.setValue([]);
                    });
                },
                error: (error) => {
                    if (error.message === 'route_has_log_entries') {
                        error.message = 'Nekaterih smeri ni mogoče izbrisati, ker imajo zabeležene vzpone.';
                    }
                    this.snackBar.open(error.message, null, {
                        panelClass: 'error',
                        duration: 3000
                    });
                }
            });
    }

    moveSelectedToSector(): void {
        const selectedRouteIds = this.routesForm.controls.selectedRouteIds.value;
        if (selectedRouteIds.length === 0) {
            return;
        }

        this.dialog
            .open(MoveRouteFormComponent, {
                data: { routeIds: selectedRouteIds, crag: this.crag, sector: this.sector }
            })
            .afterClosed()
            .pipe(take(1))
            .subscribe(() => {
                this.routesForm.controls.selectedRouteIds.setValue([]);
            });
    }
}
