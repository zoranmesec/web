import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { Comment, Crag, IceFall, Peak, Route } from 'src/generated/graphql';
import { CommentFormComponent } from '../comment-form/comment-form.component';
import { CommentOptionsComponent } from './comment-options/comment-options.component';

@Component({
    selector: 'app-comment',
    templateUrl: './comment.component.html',
    styleUrls: ['./comment.component.scss'],
    standalone: true,
    imports: [CommonModule, CommentOptionsComponent, CommentFormComponent]
})
export class CommentComponent implements OnInit, OnDestroy {
    @Input() comment: Comment;
    @Input() entity: Crag | Route | IceFall | Peak;
    @Input() commentType: string;
    @Input() previewMode = false;
    @Input() showRouteLink = false;

    isAuthor = false;

    authSub: Subscription;

    protected mode: 'view' | 'edit' = 'view';

    constructor(public authService: AuthService) {}

    ngOnInit(): void {
        this.authSub = this.authService.currentUser.subscribe(
            (user) => (this.isAuthor = user !== null && this.comment.user !== null && this.comment.user.id === user.id)
        );
    }

    ngOnDestroy(): void {
        this.authSub.unsubscribe();
    }

    protected editComment(comment: Comment) {
        this.comment = comment;
        this.mode = 'edit';
    }
}
