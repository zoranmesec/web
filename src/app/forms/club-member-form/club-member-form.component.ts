import { Component, Inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatCheckbox } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ErrorLike, MutateResult } from '@apollo/client';
import { Club, CreateClubMemberByEmailGQL, CreateClubMemberByEmailMutation } from '../../../generated/graphql';

@Component({
    selector: 'app-club-member-form',
    templateUrl: './club-member-form.component.html',
    styleUrls: ['./club-member-form.component.scss'],
    imports: [MatFormField, MatCheckbox, MatLabel, MatDialogContent, FormsModule, ReactiveFormsModule]
})
export class ClubMemberFormComponent  {
    addMemberForm = new UntypedFormGroup({
        email: new UntypedFormControl('', [Validators.required, Validators.email]),
        admin: new UntypedFormControl(false)
    });

    loading = false;

    constructor(
        @Inject(MAT_DIALOG_DATA)
        public data: { clubId: string; clubName: string; club: Club },
        private dialogRef: MatDialogRef<ClubMemberFormComponent>,
        private snackbar: MatSnackBar,
        private createClubMemberByEmailGQL: CreateClubMemberByEmailGQL
    ) {}

    onSubmit() {
        const email = this.addMemberForm.value.email;
        const admin = this.addMemberForm.value.admin;

        this.loading = true;

        this.createClubMemberByEmailGQL
            .mutate({
                variables: {
                    input: {
                        admin: admin,
                        userEmail: email,
                        clubId: this.data.clubId
                    }
                },

                update: (cache) => {
                    cache.evict({
                        id: cache.identify(this.data.club)
                    });

                    // remove from cache all queries on activityRoutes for club members - will need to fetch again because we have a new member
                    cache.evict({
                        id: 'ROOT_QUERY',
                        fieldName: 'activityRoutesByClubSlug'
                    });
                }
            })
            .subscribe({
                next: (result: MutateResult<CreateClubMemberByEmailMutation>) => {
                    if (result.error !== null) {
                        this.queryError(result.error);
                    } else {
                        this.querySuccess();
                    }
                },
                error: () => {
                    this.displayError();
                }
            });
    }

    queryError(errors: ErrorLike) {
        if (errors.message.startsWith('Could not find any entity of type')) {
            this.displayError('Uporabnik s tem e-poštnim naslovom ni bil najden.');
        } else if (errors.message.startsWith('duplicate key value violates unique constraint')) {
            this.displayError('Uporabnik s tem e-poštnim naslovom je že član kluba.');
        } else if (errors.message === 'Forbidden') {
            // should not really happen, because only club admins should see the option for adding members
            this.displayError('Samo administratorji kluba lahko dodajajo člane.');
        } else {
            this.displayError();
        }
        this.dialogRef.close(false);
    }

    querySuccess() {
        this.displaySuccess();
        this.dialogRef.close(true);
    }

    displaySuccess() {
        this.snackbar.open('Uporabnik je bil uspešno dodan med člane kluba.', null, {
            duration: 3000
        });
    }

    displayError(errorMessage = 'Prišlo je do nepričakovane napake.') {
        this.snackbar.open(errorMessage, null, {
            panelClass: 'error',
            duration: 3000
        });
    }
}
