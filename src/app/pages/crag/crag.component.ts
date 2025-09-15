import { Component, OnDestroy, OnInit } from '@angular/core';
import { DataError } from 'src/app/types/data-error';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LayoutService } from 'src/app/services/layout.service';
import { Subject, Subscription } from 'rxjs';
import { Tab } from '../../types/tab';
import { AuthService } from 'src/app/auth/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { CommentFormComponent } from 'src/app/shared/components/comment-form/comment-form.component';
import {
  CragBySlugGQL,
  CragBySlugQuery,
  Comment,
  Crag,
} from 'src/generated/graphql';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { User } from '@sentry/angular';
import { ScrollService } from 'src/app/services/scroll.service';
import { ImageUploadComponent } from 'src/app/shared/components/image-upload/image-upload.component';
import { QueryRef } from 'apollo-angular';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { CragRoutesComponent } from './crag-routes/crag-routes.component';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { CragInfoComponent } from './crag-info/crag-info.component';
import { CragCommentsComponent } from './crag-comments/crag-comments.component';
import { CragGalleryComponent } from './crag-gallery/crag-gallery.component';
import { DefaultShowHideDirective } from 'ng-flex-layout';

@Component({
  selector: 'app-crag',
  templateUrl: './crag.component.html',
  styleUrls: ['./crag.component.scss'],
  imports: [
    CommonModule,
    MatMenuModule,
    CragInfoComponent,
    CragCommentsComponent,
    CragRoutesComponent,
    CragGalleryComponent,
    MatMenuModule,
    MatIconModule,
    RouterModule,
    DefaultShowHideDirective,
  ],
})
export class CragComponent implements OnInit, OnDestroy {
  loading: boolean = true;
  error: DataError = null;

  crag: CragBySlugQuery['cragBySlug'];

  warnings: CragBySlugQuery['cragBySlug']['comments'];

  map: any;

  action$ = new Subject<string>();

  isPrivate = false;
  user: User;

  tabs: Array<Tab> = [
    {
      slug: 'smeri',
      label: 'Smeri',
      icon: 'route',
    },
    {
      slug: 'info',
      label: 'Info',
      icon: 'info',
    },
    {
      slug: 'komentarji',
      label: 'Komentarji',
      icon: 'comment',
    },
    {
      slug: 'galerija',
      label: 'Galerija',
      icon: 'image',
    },
  ];

  activeTab: string = 'smeri';
  section: string;

  cragQuery: QueryRef<any>;
  cragSub: Subscription;
  subscriptions: Subscription[] = [];

  constructor(
    private layoutService: LayoutService,
    private authService: AuthService,
    private dialog: MatDialog,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private cragBySlugGQL: CragBySlugGQL,
    private breakpointObserver: BreakpointObserver,
    private scrollService: ScrollService,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ) {
    let url = this.domSanitizer.bypassSecurityTrustResourceUrl(
      '../../../assets/icons/info.svg'
    );
    this.matIconRegistry.addSvgIcon('info', url);
    url = this.domSanitizer.bypassSecurityTrustResourceUrl(
      '../../../assets/icons/image.svg'
    );
    this.matIconRegistry.addSvgIcon('image', url);
    url = this.domSanitizer.bypassSecurityTrustResourceUrl(
      '../../../assets/icons/route.svg'
    );
    this.matIconRegistry.addSvgIcon('route', url);
    url = this.domSanitizer.bypassSecurityTrustResourceUrl(
      '../../../assets/icons/comment.svg'
    );
    this.matIconRegistry.addSvgIcon('comment', url);
  }

  ngOnInit(): void {
    const userSub = this.authService.currentUser.subscribe(
      (user) => (this.user = user)
    );
    this.subscriptions.push(userSub);

    this.section = this.router.url.includes('/alpinizem/stena')
      ? 'alpinism'
      : 'sport';

    this.layoutService.$breadcrumbs.next(
      this.section === 'alpinism'
        ? [
            { name: 'Alpinizem', path: '/alpinizem' },
            {
              name: 'Vrhovi',
              path: '/alpinizem/vrhovi/drzave',
            },
          ]
        : [
            {
              name: 'Plezališča',
            },
          ]
    );

    const routeSub = this.activatedRoute.params.subscribe((params) => {
      this.loading = true;

      if (this.cragSub != null) {
        this.cragSub.unsubscribe();
      }

      this.cragQuery = this.cragBySlugGQL.watch({
        crag: params.crag,
      });

      this.cragSub = this.cragQuery.valueChanges.subscribe({
        next: (result) => {
          this.loading = false;
          this.querySuccess(result.data.cragBySlug);

          if (
            params.tab == 'smeri' &&
            !this.breakpointObserver.isMatched([
              Breakpoints.Small,
              Breakpoints.XSmall,
            ])
          ) {
            this.setActiveTab(this.tabs[0]);
          } else if (params.tab != null) {
            this.activeTab = params.tab;
          } else {
            this.activeTab = 'smeri';
          }
          console.log(this.activeTab);
        },
        error: (error) => {
          this.loading = false;
          this.queryError(error);
        },
      });
    });
    this.subscriptions.push(routeSub);

    const actionsSub = this.action$.subscribe((action) => {
      switch (action) {
        case 'add-comment':
          this.addComment('comment');
          break;
        case 'add-condition':
          this.addComment('condition');
          break;
        case 'add-warning':
          this.addComment('warning');
          break;
      }
    });
    this.subscriptions.push(actionsSub);

    const breakpointSub = this.breakpointObserver
      .observe([Breakpoints.Small, Breakpoints.XSmall])
      .subscribe((res) => {
        if (!res.matches && this.activeTab == 'info') {
          this.setActiveTab(this.tabs[1]);
        }
      });
    this.subscriptions.push(breakpointSub);
  }

  ngOnDestroy() {
    this.cragSub.unsubscribe();
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  queryError(error: Error) {
    if (error.message === 'entity_not_found') {
      this.error = {
        message: 'Plezališče ne obstaja v bazi.',
      };
      return;
    }

    this.error = {
      message: 'Prišlo je do nepričakovane napake pri zajemu podatkov.',
    };
  }

  querySuccess(cragBySlug: CragBySlugQuery['cragBySlug']) {
    this.crag = cragBySlug;
    this.warnings = (this.crag as Crag).comments?.filter(
      (comment: Comment) => comment.type === 'warning'
    );

    if (this.section === 'alpinism') {
      this.layoutService.$breadcrumbs.next([
        {
          name: 'Alpinizem',
          path: '/alpinizem',
        },
        {
          name: 'Vrhovi',
          path: '/alpinizem/vrhovi/drzave',
        },
        {
          name: this.crag.country.name,
          path: '/alpinizem/vrhovi/drzava/' + this.crag.country.slug,
        },
        {
          name: this.crag.peak.name,
          path: '/alpinizem/vrhovi/vrh/' + this.crag.peak.slug,
        },
        {
          name: this.crag.name,
        },
      ]);
    } else {
      this.layoutService.$breadcrumbs.next([
        {
          name: 'Plezališča',
          path: '/plezalisca',
        },
        {
          name: this.crag.country.name,
          path: '/plezalisca/' + this.crag.country.slug,
        },
        {
          name: this.crag.name,
        },
      ]);

      this.layoutService.setTitle([
        `Plezališče ${this.crag.name}`,
        this.crag.country.name,
      ]);

      this.scrollService.restoreScroll();
    }
  }

  setActiveTab(tab: Tab) {
    this.router.navigate([tab.slug === 'smeri' ? {} : { tab: tab.slug }], {
      relativeTo: this.activatedRoute,
    });
  }

  async addImage() {
    const allowed = await this.authService.guardedAction({});
    if (allowed) {
      this.dialog
        .open(ImageUploadComponent, {
          data: {
            entityType: 'crag',
            entityId: this.crag.id,
            user: this.user,
          },
          autoFocus: false,
        })
        .afterClosed()
        .subscribe((result) => {
          if (!result) {
            return;
          }
          this.loading = true;
          this.cragQuery.refetch();
          if (this.activeTab !== 'galerija') {
            this.setActiveTab({
              slug: 'galerija',
              label: 'Galerija',
              icon: 'photo',
            });
          }
        });
    }
  }

  addComment(type: string) {
    this.authService.guardedAction({}).then((success) => {
      if (success) {
        this.dialog.open(CommentFormComponent, {
          data: {
            crag: this.crag,
            type: type,
          },
          autoFocus: false,
        });
      }
    });
  }

  onImageClicked() {
    this.setActiveTab({
      slug: 'galerija',
      label: 'Galerija',
      icon: 'photo',
    });
  }
}
