import { Component } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Apollo, gql } from 'apollo-angular';

@Component({
    selector: 'app-password-recovery',
    templateUrl: './password-recovery.component.html',
    styleUrls: ['../login/login.component.scss'],
    standalone: false
})
export class PasswordRecoveryComponent {
    loading = false;
    success = false;

    constructor(
        private apollo: Apollo,
        private snackbar: MatSnackBar
    ) {}

    passwordForm = new UntypedFormGroup({
        email: new UntypedFormControl('', [Validators.required, Validators.email])
    });



    recover(): void {
        this.loading = true;

        const value = this.passwordForm.value;

        this.apollo
            .mutate({
                mutation: gql`
        mutation {
          recover(email: "${value.email}")
        }
      `
            })
            .subscribe(
                () => {
                    this.loading = false;
                    this.success = true;
                },
                (_error) => {
                    this.loading = false;
                    this.snackbar.open('Račun s tem e-naslovom ne obstaja.', null, {
                        panelClass: 'error',
                        duration: 3000
                    });
                }
            );
    }
}
