import { Component, inject, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Apollo } from 'apollo-angular';
import { FlexLayoutModule } from 'ng-flex-layout';
import { AuthService } from 'src/app/auth/auth.service';
import { CreateSectorInput, ManagementCreateSectorGQL, ManagementUpdateSectorGQL, Sector } from '../../../../generated/graphql';

export interface SectorFormComponentData {
    sector?: Sector;
    position?: number;
    cragId?: string;
}

@Component({
    selector: 'app-sector-form',
    templateUrl: './sector-form.component.html',
    styleUrls: ['./sector-form.component.scss'],
    imports: [FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatDialogActions, FlexLayoutModule, MatButtonModule]
})
export class SectorFormComponent implements OnInit {
    saving = false;

    fb: FormBuilder = inject(FormBuilder);
    form = this.fb.group({
        label: this.fb.control({ value: '', disabled: true }, [Validators.required]),
        name: new FormControl(''),
        publishStatus: new FormControl('draft')
    });

    constructor(
        private authService: AuthService,
        @Inject(MAT_DIALOG_DATA) private data: SectorFormComponentData,
        private createGQL: ManagementCreateSectorGQL,
        private updateGQL: ManagementUpdateSectorGQL,
        private apollo: Apollo,
        private dialogRef: MatDialogRef<SectorFormComponent>,
        private snackbar: MatSnackBar
    ) {}

    ngOnInit(): void {
        if (this.data?.sector !== null) {
            this.form.patchValue(this.data.sector);
        }
    }

    save() {
        this.saving = true;

        const success = () => {
            this.apollo.client.resetStore().then(() => {
                this.saving = false;
                this.dialogRef.close();
            });
        };
        const error = () => {
            this.snackbar.open('Pri shranjevanju je prišlo do napake', null, {
                panelClass: 'error',
                duration: 3000
            });
            this.saving = false;
        };

        if (this.data.sector !== null) {
            this.updateGQL
                .mutate({
                    variables: { input: { ...this.form.value, id: this.data.sector.id } }
                })
                .subscribe({
                    next: success,
                    error: error
                });
        } else {
            const input: CreateSectorInput = {
                ...this.form.value,
                position: this.data.position,
                cragId: this.data.cragId
            };
            this.createGQL
                .mutate({
                    variables: {
                        input: {
                            ...this.form.value,
                            position: this.data.position,
                            cragId: this.data.cragId
                        }
                    }
                })
                .subscribe({
                    next: success,
                    error: error
                });
        }
    }
}
