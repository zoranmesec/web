
import { Component, Input, OnChanges, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { Subject } from 'rxjs';
import { CommentComponent } from 'src/app/shared/components/comment/comment.component';
import { Comment, Crag } from 'src/generated/graphql';
import { CommentFormComponent } from 'src/app/shared/components/comment-form/comment-form.component';

@Component({
  selector: 'app-crag-comments',
  templateUrl: './crag-comments.component.html',
  styleUrls: ['./crag-comments.component.scss'],
  imports: [
    MatButtonModule,
    CommentComponent,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatRadioModule,
    CommentFormComponent
],
  standalone: true,
})
export class CragCommentsComponent implements OnInit, OnChanges {
  @Input() crag: Crag;
  @Input() action: Subject<string>;
  comments: Comment[];
  protected commentForm!: FormGroup;

  constructor(private readonly fb: FormBuilder) {}

  ngOnInit(): void {
    this.commentForm = this.fb.group({
      content: this.fb.control(''),
      commentType: this.fb.control('komentar'),
    });
  }

  ngOnChanges(): void {
    this.comments = this.crag.comments;
  }

  protected submitComment(): void {
    if (this.commentForm.valid) {
      this.comments = [...this.comments];
      this.commentForm.reset({ content: '', commentType: 'komentar' });
      this.action.next('commentAdded');
    }
  }

  protected onCommentSaved($event: any): void {
    this.comments = [...this.crag.comments];
  }
}
