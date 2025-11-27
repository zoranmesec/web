import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ConfirmationDialogData } from '../../../types/confirmation-dialog-data';

@Component({
    selector: 'app-confirmation-dialog',
    templateUrl: './confirmation-dialog.component.html',
    styleUrls: ['./confirmation-dialog.component.scss'],
    imports: [MatDialogModule, MatButtonModule, MatIconModule]
})
export class ConfirmationDialogComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogData) {}
}
