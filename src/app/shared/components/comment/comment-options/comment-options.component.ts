import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { take } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Comment, DeleteCommentGQL, namedOperations } from 'src/generated/graphql';
import { ConfirmationDialogComponent } from '../../confirmation-dialog/confirmation-dialog.component';

@Component({
    selector: 'app-comment-options',
    templateUrl: './comment-options.component.html',
    styleUrls: ['./comment-options.component.scss'],
    standalone: true,
    imports: [MatMenuModule, MatButtonModule, MatIconModule]
})
export class CommentOptionsComponent{
    @Input() comment: Comment;
    @Output() editComment = new EventEmitter<Comment>();

    constructor(
        private deleteCommentGQL: DeleteCommentGQL,
        private dialog: MatDialog,
        private authService: AuthService,
        private snackbar: MatSnackBar
    ) {}

    edit() {
        this.editComment.emit(this.comment);
    }

    remove() {
        this.dialog
            .open(ConfirmationDialogComponent, {
                data: {
                    message: 'Pobrišem komentar?'
                }
            })
            .afterClosed()
            .subscribe((result) => {
                if (result !== null) {
                    this.deleteCommentGQL
                        .mutate({
                            variables: { id: this.comment.id },
                            refetchQueries: [
                                namedOperations.Query.CragBySlug,
                                namedOperations.Query.IceFallBySlug,
                                namedOperations.Query.LatestComments
                            ]
                        })
                        .pipe(take(1))
                        .subscribe({
                            error: () => {
                                this.snackbar.open('Komentarja ni bilo mogoče odstraniti', null, {
                                    panelClass: 'error',
                                    duration: 3000
                                });
                            }
                        });
                }
            });
    }
}
