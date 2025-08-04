import { Component, Inject, OnInit } from '@angular/core';
import {
  UntypedFormGroup,
  UntypedFormControl,
  Validators,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MatDialogRef,
  MatDialog,
  MatDialogContent,
} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../auth.service';
import { PasswordRecoveryComponent } from '../password-recovery/password-recovery.component';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LoginGQL, LoginResponse } from '../../../generated/graphql';
import { MatLabel, MatFormField, MatHint } from '@angular/material/form-field';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [
    MatLabel,
    MatFormField,
    MatHint,
    MatDialogContent,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
  ],
  standalone: true,
})
export class LoginComponent implements OnInit {
  loading = false;

  constructor(
    private authService: AuthService,
    private dialogRef: MatDialogRef<LoginComponent>,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private loginGQL: LoginGQL,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      message: string;
    }
  ) {}

  loginForm = new UntypedFormGroup({
    email: new UntypedFormControl('', [Validators.required, Validators.email]),
    password: new UntypedFormControl('', [Validators.required]),
  });

  ngOnInit(): void {}

  passwordRecovery(): boolean {
    this.dialog.open(PasswordRecoveryComponent);
    this.dialogRef.close();

    return false;
  }

  login(): void {
    this.loading = true;

    const value = this.loginForm.value;

    this.loginGQL.mutate(value).subscribe({
      next: async (result) => {
        await this.authService.login(<LoginResponse>result.data.login);
        this.dialogRef.close(true);
      },
      error: () => {
        this.loading = false;
        this.snackbar.open('Prijava ni uspela.', null, {
          panelClass: 'error',
          duration: 3000,
        });
      },
    });
  }
}
