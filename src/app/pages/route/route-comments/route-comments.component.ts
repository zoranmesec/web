
import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { FlexLayoutModule } from 'ng-flex-layout';
import { Subject } from 'rxjs';
import { CommentFormComponent } from 'src/app/shared/components/comment-form/comment-form.component';
import { CommentComponent } from 'src/app/shared/components/comment/comment.component';
import { Comment, Route } from 'src/generated/graphql';

@Component({
  selector: 'app-route-comments',
  templateUrl: './route-comments.component.html',
  styleUrls: ['./route-comments.component.scss'],
  standalone: true,
  imports: [
    CommentComponent,
    FlexLayoutModule,
    MatButtonModule,
    MatExpansionModule,
    CommentFormComponent
],
})
export class RouteCommentsComponent implements AfterViewInit, OnChanges {
  comments: Comment[];

  @Output() onViewInit = new EventEmitter<void>();
  @Input() action$: Subject<string>;
  @Input() route: Route;
  @Input() previewMode: boolean = false;

  constructor() {}

  addComment(actionType: string) {
    this.action$.next(actionType);
  }

  ngOnChanges(): void {
    this.comments = this.route.comments;
  }

  ngAfterViewInit(): void {
    // this is used when this component is a child of CragRoutePreviewComponent which measures the height after view init
    this.onViewInit.emit();
  }

  protected onCommentSaved($event: any): void {
    this.comments = [...this.route.comments];
  }
}
