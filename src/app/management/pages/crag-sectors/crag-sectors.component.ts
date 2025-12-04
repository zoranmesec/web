import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { combineLatest, filter, Subscription, switchMap, take } from 'rxjs';
import {
    Crag,
    ManagementDeleteSectorGQL,
    ManagementGetCragSectorsGQL,
    ManagementSaveSectorPositionGQL,
    Sector,
    User
} from 'src/generated/graphql';

import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { AuthService } from 'src/app/auth/auth.service';
import { BreakpointService } from 'src/app/services/breakpoint.service';
import { TitleComponent } from 'src/app/shared/components/title/title.component';
import { IconsModule } from 'src/app/shared/icons/icons.module';
import { LayoutService } from '../../../services/layout.service';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { MoveSectorFormComponent } from '../../forms/move-sector-form/move-sector-form.component';
import { SectorFormComponent } from '../../forms/sector-form/sector-form.component';
import { CragAdminBreadcrumbs } from '../../utils/crag-admin-breadcrumbs';
import { ContributionService } from '../contributions/contribution/contribution.service';

@Component({
    selector: 'app-crag-sectors',
    templateUrl: './crag-sectors.component.html',
    styleUrls: ['./crag-sectors.component.scss'],
    standalone: true,
    imports: [
        MatButtonModule,
        MatMenuModule,
        TitleComponent,
        IconsModule,
        CdkDropList,
        CdkDrag,
        MatTooltipModule,
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatCheckboxModule,
        MatDividerModule
    ]
})
export class CragSectorsComponent implements OnInit, OnDestroy {
    loading = true;
    savingPositions = false;
    heading = '';

    crag: Crag;
    sectors: Sector[];

    subscriptions: Subscription[] = [];

    user: User;
    protected isAddingSectors = false;
    protected sectorSettingsForm = this.formBuilder.group({
        isAddingSectors: [false]
    });

    constructor(
        private authService: AuthService,
        private snackBar: MatSnackBar,
        private dialog: MatDialog,
        private activatedRoute: ActivatedRoute,
        private layoutService: LayoutService,
        private sectorsGQL: ManagementGetCragSectorsGQL,
        private savePositionGQL: ManagementSaveSectorPositionGQL,
        private deleteSectorGQL: ManagementDeleteSectorGQL,
        private apollo: Apollo,
        public contributionService: ContributionService,
        protected readonly breakpointService: BreakpointService,
        private readonly router: Router,
        private readonly formBuilder: FormBuilder
    ) {}

    ngOnInit(): void {
        const sub = combineLatest([
            this.activatedRoute.params.pipe(
                filter((params) => params.crag !== null),
                switchMap(
                    ({ crag }) =>
                        this.sectorsGQL.watch({
                            variables: { id: crag }
                        }).valueChanges
                )
            ),
            this.authService.currentUser.asObservable()
        ]).subscribe(([result, user]) => {
            if (result.data !== undefined) {
                this.loading = false;

                this.crag = result.data.crag as Crag;

                this.user = user;

                this.heading = `${this.crag.name}`;
                this.layoutService.$breadcrumbs.next(new CragAdminBreadcrumbs(this.crag).build());

                this.sectors = [...(result.data.crag.sectors as Sector[])];

                this.sectorSettingsForm.patchValue({
                    isAddingSectors: this.hasSectors
                });
            }
        });

        this.subscriptions.push(sub);

        const settingsSub = this.sectorSettingsForm.valueChanges.subscribe((value) => {
            this.isAddingSectors = value.isAddingSectors;
            if (this.sectors.length > 1 && !this.sectorSettingsForm.controls['isAddingSectors'].disabled) {
                console.log('disabling');
                //disable isAddingSectors if there are multiple sectors
                this.sectorSettingsForm.controls['isAddingSectors'].disable();
            }
        });
        this.subscriptions.push(settingsSub);
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((sub) => sub.unsubscribe());
    }

    drop(event: CdkDragDrop<string[]>) {
        console.log(event);
        if (event.previousIndex === event.currentIndex) return;

        const data = {
            id: this.sectors[event.previousIndex].id,
            position:
                event.currentIndex > event.previousIndex
                    ? this.sectors[event.currentIndex].position + 1
                    : this.sectors[event.currentIndex].position
        };

        // move in FE to see changes even before BE responds
        moveItemInArray(this.sectors, event.previousIndex, event.currentIndex);

        this.savingPositions = true;

        this.savePositionGQL.mutate({ variables: { input: data }, fetchPolicy: 'no-cache' }).subscribe(() => {
            this.apollo.client.resetStore().then(() => {
                this.savingPositions = false;
                this.snackBar.open('Vrstni red sektorjev je bil shranjen', null, {
                    duration: 2000
                });
            });
        });
    }

    canEdit(sector: Sector): boolean {
        return this.user.roles.includes('admin') || sector.publishStatus === 'draft';
    }

    add(): void {
        this.dialog.open(SectorFormComponent, {
            data: {
                position: this.sectors.length === 0 ? 1 : this.sectors[this.sectors.length - 1].position + 1,
                cragId: this.crag.id
            }
        });
    }

    edit(sector: Sector): void {
        this.dialog.open(SectorFormComponent, { data: { sector: sector } });
    }

    moveToCrag(sector: Sector): void {
        this.dialog.open(MoveSectorFormComponent, {
            data: {
                crag: this.crag,
                sector: sector,
                countrySlug: this.crag.country.slug
            }
        });
    }

    remove(sector: Sector): void {
        this.dialog
            .open(ConfirmationDialogComponent, {
                data: {
                    title: 'Brisanje sektorja',
                    message: 'Si prepričan_a, da želiš izbrisati ta sektor in vse smeri v njem?'
                }
            })
            .afterClosed()
            .pipe(
                take(1),
                filter((value) => value !== undefined && value !== null),
                switchMap(() => this.deleteSectorGQL.mutate({ variables: { id: sector.id } }))
            )
            .subscribe({
                next: () =>
                    this.apollo.client.resetStore().then(() => {
                        this.snackBar.open('Sektor je bil izbrisan', null, {
                            duration: 2000
                        });
                    }),
                error: (error) => {
                    if (error.message === 'route_has_log_entries') {
                        error.message = 'Sektorja ni mogoče izbrisati dokler so v njem smeri, ki imajo zabeležene vzpone.';
                    }
                    this.snackBar.open(error.message, null, {
                        panelClass: 'error',
                        duration: 3000
                    });
                }
            });
    }

    protected goToCrag(): void {
        this.router.navigate(['/urejanje/uredi-plezalisce', this.crag.id]);
    }

    get hasSectors(): boolean {
        // find sector with empty label
        const defaultSector = this.sectors?.find((sector) => sector.position === 0);
        if (defaultSector && this.sectors.length === 1 && this.sectorSettingsForm.get('isAddingSectors').value === false) {
            return false;
        }

        return true;
    }
}
