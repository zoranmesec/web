import { DatePipe } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Apollo } from 'apollo-angular';
import { Subscription } from 'rxjs';
import { GradeComponent } from 'src/app/shared/components/grade/grade.component';
import { Crag, ManagementMoveRouteGetRouteGQL, ManagementMoveRouteToSectorGQL, Route, Sector } from 'src/generated/graphql';

export interface MergeRouteFormComponentData {
    primaryRoute: Route;
    secondaryRoute: Route;
    crag: Crag;
    sector: Sector;
    withinSector?: Sector;
}

@Component({
    selector: 'app-merge-route-form',
    templateUrl: './merge-route-form.component.html',
    styleUrls: ['./merge-route-form.component.scss'],
    imports: [
        MatDialogModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatButtonModule,
        MatSelectModule,
        MatRadioModule,
        GradeComponent,
        DatePipe
    ]
})
export class MergeRouteFormComponent implements OnInit, OnDestroy {
    form = new FormGroup({
        sourceRoute: new FormControl(null)
    });
    saving = false;
    subscriptions: Subscription[] = [];
    targetSectors: Sector[];
    targetSector: Sector;

    sourceRoute: Route;
    targetRoute: Route;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: MergeRouteFormComponentData,
        private apollo: Apollo,
        private snackBar: MatSnackBar,
        private dialogRef: MatDialogRef<MergeRouteFormComponent>,
        private managementMoveRouteGetRouteGQL: ManagementMoveRouteGetRouteGQL,
        private managementMoveRouteToSectorGQL: ManagementMoveRouteToSectorGQL
    ) {}

    ngOnInit(): void {
        console.log('MergeRouteFormComponent initialized with data:', this.data);

        const firstRouteSub = this.managementMoveRouteGetRouteGQL
            .fetch({
                variables: { id: this.data.primaryRoute.id }
            })
            .subscribe(({ data }) => {
                this.sourceRoute = data.route as Route;
            });
        this.subscriptions.push(firstRouteSub);

        const secondRouteSub = this.managementMoveRouteGetRouteGQL
            .fetch({
                variables: { id: this.data.secondaryRoute.id }
            })
            .subscribe(({ data }) => {
                this.sourceRoute = data.route as Route;
            });
        this.subscriptions.push(secondRouteSub);
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    }

    save(): void {
        this.saving = true;

        const success = () => {
            this.apollo.client.resetStore().then(() => {
                this.dialogRef.close();
            });
        };
        const error = () => {
            this.snackBar.open('Pri premikanju je prišlo do napake', null, {
                panelClass: 'error',
                duration: 3000
            });
        };

        this.managementMoveRouteToSectorGQL
            .mutate({
                variables: {
                    input: {
                        targetRouteId: this.form.value.sourceRoute?.id,
                        id:
                            this.data.primaryRoute.id === this.form.value.sourceRoute?.id
                                ? this.data.secondaryRoute.id
                                : this.data.primaryRoute.id,
                        sectorId: this.data.sector.id
                        // primaryRoute: this.form.controls.primarySelection.value
                    }
                }
            })
            .subscribe({
                next: success,
                error: error
            });
    }
}
