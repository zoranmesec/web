import { HttpClient } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatCheckbox, MatCheckboxChange } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from 'src/environments/environment';
import { User } from 'src/generated/graphql';

@Component({
    selector: 'app-image-upload',
    templateUrl: './image-upload.component.html',
    styleUrls: ['./image-upload.component.scss'],
    imports: [MatDialogActions, MatCheckbox, MatFormField, MatInput, MatLabel, FormsModule, ReactiveFormsModule, MatDialogContent]
})
export class ImageUploadComponent {
    fileToUpload: File;
    loading = false;
    form = new UntypedFormGroup({
        image: new UntypedFormControl(),
        title: new UntypedFormControl(),
        userIsAuthor: new UntypedFormControl(true)
    });
    authorFC = new UntypedFormControl(null, Validators.required);

    constructor(
        @Inject(MAT_DIALOG_DATA)
        public data: { entityType: string; entityId: string; user: User },
        public dialogRef: MatDialogRef<ImageUploadComponent>,
        private http: HttpClient,
        private snackBar: MatSnackBar
    ) {}

    onUserIsAuthorChange(event: MatCheckboxChange) {
        if (event.checked) {
            this.form.removeControl('author');
        } else {
            this.form.addControl('author', this.authorFC);
        }
    }

    onFileSelected(event: Event) {
        this.fileToUpload = (event.target as HTMLInputElement).files.item(0);
    }

    submit() {
        this.loading = true;

        const formData = new FormData();
        formData.append('image', this.fileToUpload);
        formData.append('entityType', this.data.entityType);
        formData.append('entityId', this.data.entityId);
        if (this.form.get('title').value) {
            formData.append('title', this.form.get('title').value);
        }
        const author = this.form.controls.userIsAuthor.value ? this.data.user.fullName : this.form.get('author').value;
        formData.append('author', author);

        this.http.post(`${environment.uploadUrl}/image`, formData).subscribe({
            next: () => {
                this.loading = false;
                this.snackBar.open('Fotografija je bila shranjena.', null, {
                    duration: 3000
                });
                this.dialogRef.close(true);
            },
            error: () => {
                this.loading = false;
                this.snackBar.open('Fotografije ni bilo mogoče shraniti.', null, {
                    duration: 3000,
                    panelClass: 'error'
                });
            }
        });
    }
}
