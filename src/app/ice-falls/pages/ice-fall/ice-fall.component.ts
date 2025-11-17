import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Params } from '@angular/router';
import { Subject } from 'rxjs';
import {
  Area,
  Comment,
  IceFall,
  IceFallBySlugGQL,
  IceFallBySlugQuery,
} from '../../../../generated/graphql';
import { AuthService } from '../../../auth/auth.service';
import { LayoutService } from '../../../services/layout.service';
import { CommentFormComponent } from '../../../shared/components/comment-form/comment-form.component';
import { DataError } from '../../../types/data-error';
import { IceFallsBreadcrumbs } from '../../utils/ice-falls-breadcrumbs';
import { ErrorLike } from '@apollo/client';

@Component({
  selector: 'app-ice-fall',
  templateUrl: './ice-fall.component.html',
  styleUrls: ['./ice-fall.component.scss'],
  standalone: false,
})
export class IceFallComponent implements OnInit {
  loading: boolean = true;
  error: DataError = null;
  iceFall: IceFall;
  comments: Comment[];
  conditions: Comment[];

  action = new Subject<string>();

  constructor(
    private activatedRoute: ActivatedRoute,
    private layoutService: LayoutService,
    private iceFallBySlugGQL: IceFallBySlugGQL,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params: Params) => {
      this.iceFallBySlugGQL
        .watch({
          variables: { slug: params.icefall },
        })
        .valueChanges.subscribe((result) => {
          this.loading = false;

          if (result.error != null) {
            this.queryError(result.error);
          } else {
            this.querySuccess(result.data as IceFallBySlugQuery);
          }
        });
    });

    this.action.subscribe((action) => {
      switch (action) {
        case 'add-comment':
          this.addComment('comment');
          break;
        case 'add-condition':
          this.addComment('condition');
          break;
      }
    });
  }

  queryError(error: ErrorLike): void {
    if (error.message === 'entity_not_found') {
      this.error = {
        message: 'Slap ne obstaja v bazi.',
      };

      return;
    }

    this.error = {
      message: 'Prišlo je do nepričakovane napake pri zajemu podatkov.',
    };
  }

  querySuccess(data: IceFallBySlugQuery): void {
    this.iceFall = <IceFall>data.iceFallBySlug;
    this.comments = this.iceFall?.comments.filter(
      (comment) => comment.type === 'comment'
    );

    this.conditions = this.iceFall?.comments.filter(
      (comment) => comment.type === 'condition'
    );

    this.layoutService.$breadcrumbs.next(
      new IceFallsBreadcrumbs(
        <Area>this.iceFall.area,
        <IceFall>this.iceFall
      ).build()
    );
  }

  addComment(type: string) {
    this.authService.guardedAction({}).then((success) => {
      if (success) {
        this.dialog
          .open(CommentFormComponent, {
            data: {
              iceFall: this.iceFall,
              type: type,
            },
            autoFocus: false,
          })
          .afterClosed()
          .subscribe(() => {});
      }
    });
  }
}
