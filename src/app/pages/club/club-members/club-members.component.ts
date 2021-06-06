import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GraphQLError } from 'graphql';
import {
  Club,
  DeleteClubMemberGQL,
  namedOperations,
} from 'src/generated/graphql';
import { Observable } from 'rxjs';
import { filter, mergeMap } from 'rxjs/operators';
import { ConfirmationDialogComponent } from 'src/app/common/confirmation-dialog/confirmation-dialog.component';
import { ClubService } from '../club.service';
import { AuthService } from 'src/app/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-club-members',
  templateUrl: './club-members.component.html',
  styleUrls: ['./club-members.component.scss'],
})
export class ClubMembersComponent implements OnInit {
  loading = true;
  club$: Observable<Club>;

  constructor(
    private router: Router,
    private clubService: ClubService,
    private authService: AuthService,
    private deleteClubMemberGQL: DeleteClubMemberGQL,
    private snackbar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.club$ = this.clubService.club$;
  }

  deleteMember(id: string, memberFullName: string, memberUserId: string) {
    this.dialog
      .open(ConfirmationDialogComponent, {
        data: {
          message: `Ali res želiš odstraniti člana ${memberFullName} iz kluba?`,
        },
      })
      .afterClosed()
      .pipe(
        filter((result) => !!result),
        mergeMap((_) => {
          return this.deleteClubMemberGQL.mutate(
            { id },
            {
              errorPolicy: 'all',
              refetchQueries: [
                namedOperations.Query.MyClubs, // in case memmber deletes herself
                namedOperations.Query.ClubById,
              ],
            }
          );
        })
      )
      .subscribe(
        (data) => {
          if (data.errors != null) {
            this.queryError(data.errors);
          } else {
            this.displaySuccess();

            // check if maybe member deleted herself, if so, should redirect to club list
            if (this.authService.currentUser.id === memberUserId) {
              this.router.navigate(['/moj-profil/moji-klubi']);
            }
          }
        },
        (_) => {
          this.queryError();
        }
      );
  }

  queryError(errors?: readonly GraphQLError[]) {
    let errorMessage = 'Prišlo je do nepričakovane napake.'; // set default error message
    if (errors && errors.length > 0 && errors[0].message === 'Forbidden')
      errorMessage = 'Nimaš pravic za odstranjevanje članov.';
    this.displayError(errorMessage);
  }

  displayError(errorMessage: string) {
    this.snackbar.open(errorMessage, null, {
      panelClass: 'error',
      duration: 3000,
    });
  }

  displaySuccess() {
    this.snackbar.open('Član je bil uspešno odstranjen iz kluba.', null, {
      duration: 3000,
    });
  }
}
