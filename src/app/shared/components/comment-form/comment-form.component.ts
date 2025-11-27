import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, UntypedFormControl, Validators } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import dayjs from 'dayjs';
import { Activity, Comment, Crag, CreateCommentGQL, IceFall, namedOperations, Peak, Route, UpdateCommentGQL } from 'src/generated/graphql';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';

export interface DialogData {
    comment?: Comment;
    type?: string;
    iceFall?: IceFall;
    route?: Route;
    crag?: Crag;
    peak?: Peak;
    activity?: Activity;
}

@Component({
    selector: 'app-comment-form',
    templateUrl: './comment-form.component.html',
    styleUrls: ['./comment-form.component.scss'],
    imports: [MatDialogModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatRadioModule, MatInputModule, MatButtonModule],
    standalone: true
})
export class CommentFormComponent implements OnInit {
    @Input() entity: Crag | Route | IceFall | Peak;
    @Input() comment?: Comment;
    title: string;

    loading = false;

    protected commentForm!: FormGroup;

    minDate = new Date();
    maxDate?: Date;

    constructor(
        private snackbar: MatSnackBar,
        private createCommentGQL: CreateCommentGQL,
        private updateCommentGQL: UpdateCommentGQL,
        private readonly fb: FormBuilder
    ) {}

    ngOnInit(): void {
        this.commentForm = this.fb.group({
            content: this.fb.control('', {
                validators: [Validators.required, Validators.minLength(3)]
            }),
            commentType: this.fb.control<string>('comment', {
                nonNullable: true
            })
        });
        if (this.comment?.type) {
            this.commentForm.patchValue({
                commentType: this.comment.type
            });
        }

        this.updateFormType();

        if (this.comment !== undefined) {

            this.commentForm.patchValue({
                content: this.comment.content,
                type: this.comment.type
            });
        }
    }

    updateFormType() {
        switch (this.type) {
            case 'comment':
                if (this.comment !== null) {
                    this.title = 'Uredi komentar';
                } else {
                    this.title = 'Dodaj komentar';
                }

                this.removeExposedUntilField();
                break;
            case 'warning':
                if (this.comment !== null) {
                    this.title = 'Uredi opozorilo';
                } else {
                    this.title = 'Dodaj opozorilo';
                }

                this.addExposedUntilField();
                if (this.comment !== null) {
                    this.commentForm.patchValue({
                        exposedUntil: this.comment.exposedUntil
                    });
                }
                break;
        }
    }

    addExposedUntilField() {
        this.commentForm.addControl('exposedUntil', new UntypedFormControl(null));
        this.maxDate = new Date();
        this.maxDate.setMonth(this.maxDate.getMonth() + 1); // let user choose max 1 month validity of warning exposure
    }

    removeExposedUntilField() {
        this.commentForm.removeControl('exposedUntil');
    }

    save() {
        if (!this.commentForm.valid) return;
        this.loading = true;
        this.commentForm.disable();

        if (this.comment !== undefined) {
            this.updateComment();
        } else {
            this.createComment();
        }
    }

    createComment() {
        const value = {
            content: this.commentForm.value.content,
            type: this.type,
            iceFallId: this.entity.__typename === 'IceFall' ? this.entity.id : null,
            routeId: this.entity.__typename === 'Route' ? this.entity.id : null,
            cragId: this.entity.__typename === 'Crag' ? this.entity.id : null,
            peakId: this.entity.__typename === 'Peak' ? this.entity.id : null,
            exposedUntil:
                this.type === 'warning' && this.commentForm.value.exposedUntil
                    ? dayjs(this.commentForm.value.exposedUntil).format('YYYY-MM-DD')
                    : null
        };

        this.createCommentGQL
            .mutate({
                variables: { input: value },
                refetchQueries: [
                    //TODO: some of these queries might not be active and trying to refetch them causes apollo warnings
                    namedOperations.Query.CragBySlug,
                    namedOperations.Query.IceFallBySlug,
                    namedOperations.Query.RouteBySlug
                ]
            })
            .subscribe({
                next: () => {
                    this.loading = false;
                },
                error: () => {
                    this.loading = false;

                    this.snackbar.open('Komentarja ni bilo mogoče objaviti', null, {
                        panelClass: 'error',
                        duration: 3000
                    });
                },
                complete: () => {
                    this.commentForm.reset();
                    this.commentForm.enable();
                }
            });
    }

    updateComment() {
        const value = {
            id: this.comment.id,
            content: this.commentForm.value.content,
            type: this.commentForm.value.commentType,
            exposedUntil: this.comment.type === 'warning' ? this.commentForm.value.exposedUntil : null
        };

        this.updateCommentGQL
            .mutate({
                variables: { input: value },
                refetchQueries: [namedOperations.Query.CragBySlug, namedOperations.Query.IceFallBySlug]
            })
            .subscribe({
                next: (_result: any) => {
                    this.loading = false;
                },
                error: () => {
                    this.loading = false;
                    this.commentForm.enable();
                    this.snackbar.open('Komentarja ni bilo mogoče shraniti', null, {
                        panelClass: 'error',
                        duration: 3000
                    });
                }
            });
    }

    get type(): string {
        return this.commentForm.value.commentType;
    }

    get contentControlHasError(): boolean {
        return this.commentForm.get('content')?.hasError('minlength')
    }
}
