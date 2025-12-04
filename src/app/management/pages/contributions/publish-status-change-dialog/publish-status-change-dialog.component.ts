import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';

@Component({
    selector: 'app-publish-status-change-dialog',
    templateUrl: './publish-status-change-dialog.component.html',
    styleUrls: ['./publish-status-change-dialog.component.scss'],
    imports: [MatDialogModule, ReactiveFormsModule, MatButtonModule, MatCheckboxModule, MatInputModule]
})
export class PublishStatusChangeDialogComponent {
    publishForm = new FormGroup({
        rejectionMessage: new FormControl('', [Validators.required]),
        cascade: new FormControl(this.data.forceCascade ?? false, [])
    });

    constructor(
        @Inject(MAT_DIALOG_DATA)
        public data: {
            title: string;
            message: string;
            cascadeMessage: string;
            newStatus: string;
            forceCascade: boolean;
            actionLabel: string;
        }
    ) {
        if (this.data.forceCascade) {
            this.publishForm.get('cascade')?.disable();
        }
    }
}
