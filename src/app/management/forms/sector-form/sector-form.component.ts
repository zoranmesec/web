import { Component, Inject, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Apollo } from 'apollo-angular';
import { take } from 'rxjs';
import { Registry } from 'src/app/types/registry';
import {
  ManagementCreateSectorGQL,
  ManagementUpdateSectorGQL,
  Sector,
} from '../../../../generated/graphql';

export interface SectorFormComponentData {
  sector?: Sector;
  position?: number;
  cragId?: string;
}

@Component({
  selector: 'app-sector-form',
  templateUrl: './sector-form.component.html',
  styleUrls: ['./sector-form.component.scss'],
})
export class SectorFormComponent implements OnInit {
  saving = false;

  statusOptions: Registry[] = [
    { value: 'public', label: 'Vidijo vsi' },
    { value: 'hidden', label: 'Samo za prijavljene' },
    { value: 'admin', label: 'Samo za admine' },
    { value: 'archive', label: 'Arhivirano' },
  ];

  form = new FormGroup({
    label: new FormControl('', [Validators.required]),
    name: new FormControl('', [Validators.required]),
    status: new FormControl(null, Validators.required),
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: SectorFormComponentData,
    private createGQL: ManagementCreateSectorGQL,
    private updateGQL: ManagementUpdateSectorGQL,
    private apollo: Apollo,
    private dialogRef: MatDialogRef<SectorFormComponent>,
    private snackbar: MatSnackBar
  ) {}

  ngOnInit(): void {
    if (this.data?.sector != null) {
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
        duration: 3000,
      });
    };

    if (this.data.sector != null) {
      this.updateGQL
        .mutate({ input: { ...this.form.value, id: this.data.sector.id } })
        .subscribe({
          next: success,
          error: error,
        });
    } else {
      this.createGQL
        .mutate({
          input: {
            ...this.form.value,
            position: this.data.position,
            cragId: this.data.cragId,
          },
        })
        .subscribe({
          next: success,
          error: error,
        });
    }
  }
}
