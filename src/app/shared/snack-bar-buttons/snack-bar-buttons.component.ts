import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { MatIconModule } from '@angular/material/icon';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

export interface SnackBarData {
    buttons: { label: string }[];
}

@Component({
    selector: 'app-snack-bar-buttons',
    templateUrl: './snack-bar-buttons.component.html',
    styleUrls: ['./snack-bar-buttons.component.scss'],
    imports: [MatButtonModule, MatIconModule]
})
export class SnackBarButtonsComponent {
    constructor(
        @Inject(MAT_SNACK_BAR_DATA) public data: SnackBarData,
        public snackBarRef: MatSnackBarRef<SnackBarButtonsComponent>
    ) {}

    closeDialog() {
        this.snackBarRef.dismiss();
    }
}
