import { Component, Inject, OnInit } from '@angular/core';
import {
  UntypedFormGroup,
  UntypedFormControl,
  Validators,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  FormControl,
  FormBuilder,
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

import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

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
    MatButtonModule,
    MatInputModule,
  ],
})
export class LoginComponent implements OnInit {
  loading = false;
  loginForm: FormGroup<{
    email: FormControl<string>;
    password: FormControl<string>;
  }>;

  constructor(
    private authService: AuthService,
    private dialogRef: MatDialogRef<LoginComponent>,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private loginGQL: LoginGQL,
    private readonly fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      message: string;
    }
  ) {}

  // loginForm = new FormGroup({
  //   email: new FormControl('', [Validators.required, Validators.email]),
  //   password: new FormControl('', [Validators.required]),
  // });

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  passwordRecovery(): boolean {
    this.dialog.open(PasswordRecoveryComponent);
    this.dialogRef.close();

    return false;
  }

  login(): void {
    this.loading = true;

    const { email, password } = this.loginForm.value;

    this.loginGQL.mutate({ variables: { email, password } }).subscribe({
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
