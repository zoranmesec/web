import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { User } from '@sentry/angular';
import { QueryRef } from 'apollo-angular';
import { Subject, Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { LayoutService } from 'src/app/services/layout.service';
import { ScrollService } from 'src/app/services/scroll.service';
import { CommentFormComponent } from 'src/app/shared/components/comment-form/comment-form.component';
import { ImageUploadComponent } from 'src/app/shared/components/image-upload/image-upload.component';
import { DataError } from 'src/app/types/data-error';
import { Comment, Crag, CragBySlugGQL, CragBySlugQuery, Exact, Scalars } from 'src/generated/graphql';
import { Tab } from '../../types/tab';

import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { DefaultShowHideDirective } from 'ng-flex-layout';
import { BreakpointService } from 'src/app/services/breakpoint.service';
import { DataErrorComponent } from 'src/app/shared/components/data-error/data-error.component';
import { LoaderComponent } from 'src/app/shared/components/loader/loader.component';
import { TitleComponent } from 'src/app/shared/components/title/title.component';
import { IconsModule } from 'src/app/shared/icons/icons.module';
import { CragCommentsComponent } from './crag-comments/crag-comments.component';
import { CragGalleryComponent } from './crag-gallery/crag-gallery.component';
import { CragInfoComponent } from './crag-info/crag-info.component';
import { CragRoutesComponent } from './crag-routes/crag-routes.component';

@Component({
    selector: 'app-crag',
    templateUrl: './crag.component.html',
    styleUrls: ['./crag.component.scss'],
    imports: [
        MatMenuModule,
        CragInfoComponent,
        CragCommentsComponent,
        CragRoutesComponent,
        CragGalleryComponent,
        MatMenuModule,
        MatIconModule,
        RouterModule,
        DefaultShowHideDirective,
        IconsModule,
        LoaderComponent,
        DataErrorComponent,
        TitleComponent,
        DataErrorComponent
    ]
})
export class CragComponent implements OnInit, OnDestroy {
    loading = true;
    error: DataError = null;

    crag: CragBySlugQuery['cragBySlug'];

    warnings: CragBySlugQuery['cragBySlug']['comments'];

    action$ = new Subject<string>();

    isPrivate = false;
    user: User;

    tabs: Tab[] = [
        {
            slug: 'smeri',
            label: 'Smeri',
            icon: 'route'
        },
        {
            slug: 'info',
            label: 'Info',
            icon: 'info'
        },
        {
            slug: 'komentarji',
            label: 'Komentarji',
            icon: 'comment'
        },
        {
            slug: 'galerija',
            label: 'Galerija',
            icon: 'image'
        }
    ];

    activeTab = 'smeri';
    section: string;

    cragQuery: QueryRef<CragBySlugQuery, Exact<{ crag: Scalars['String']['input'] }>>;
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
        private breakpointService: BreakpointService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        const userSub = this.authService.currentUser.subscribe((user) => (this.user = user));
        this.subscriptions.push(userSub);

        this.section = this.router.url.includes('/alpinizem/stena') ? 'alpinism' : 'sport';

        this.layoutService.$breadcrumbs.next(
            this.section === 'alpinism'
                ? [
                      { name: 'Alpinizem', path: '/alpinizem' },
                      {
                          name: 'Vrhovi',
                          path: '/alpinizem/vrhovi/drzave'
                      }
                  ]
                : [
                      {
                          name: 'Plezališča'
                      }
                  ]
        );

        const routeSub = this.activatedRoute.params.subscribe((params) => {
            this.loading = true;

            if (this.cragSub !== undefined) {
                this.cragSub.unsubscribe();
            }

            this.cragQuery = this.cragBySlugGQL.watch({
                variables: {
                    crag: params.crag
                }
            });

            this.cragSub = this.cragQuery.valueChanges.subscribe({
                next: (result) => {
                    if (result.data === undefined) return;

                    this.loading = false;
                    this.querySuccess(result.data.cragBySlug as CragBySlugQuery['cragBySlug']);

                    if (params.tab === 'smeri' && !this.breakpointObserver.isMatched([Breakpoints.Small, Breakpoints.XSmall])) {
                        this.setActiveTab(this.tabs[0]);
                    } else if (params.tab !== undefined) {
                        this.activeTab = params.tab;
                    } else {
                        this.activeTab = 'smeri';
                    }
                },
                error: (error) => {
                    this.loading = false;
                    this.queryError(error);
                }
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

        const breakpointSub = this.breakpointObserver.observe([Breakpoints.Small, Breakpoints.XSmall]).subscribe((res) => {
            if (!res.matches && this.activeTab === 'info') {
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
                message: 'Plezališče ne obstaja v bazi.'
            };
            return;
        }

        this.error = {
            message: 'Prišlo je do nepričakovane napake pri zajemu podatkov.'
        };
    }

    querySuccess(cragBySlug: CragBySlugQuery['cragBySlug']) {
        this.crag = cragBySlug;
        this.warnings = (this.crag as Crag).comments?.filter((comment: Comment) => comment.type === 'warning');

        if (this.section === 'alpinism') {
            this.layoutService.$breadcrumbs.next([
                {
                    name: 'Alpinizem',
                    path: '/alpinizem'
                },
                {
                    name: 'Vrhovi',
                    path: '/alpinizem/vrhovi/drzave'
                },
                {
                    name: this.crag.country.name,
                    path: '/alpinizem/vrhovi/drzava/' + this.crag.country.slug
                },
                {
                    name: this.crag.peak.name,
                    path: '/alpinizem/vrhovi/vrh/' + this.crag.peak.slug
                },
                {
                    name: this.crag.name
                }
            ]);
        } else {
            this.layoutService.$breadcrumbs.next([
                {
                    name: 'Plezališča',
                    path: '/plezalisca'
                },
                {
                    name: this.crag.country.name,
                    path: '/plezalisca/' + this.crag.country.slug
                },
                {
                    name: this.crag.name
                }
            ]);

            this.layoutService.setTitle([`Plezališče ${this.crag.name}`, this.crag.country.name]);

            this.scrollService.restoreScroll();
        }
    }

    setActiveTab(tab: Tab) {
        this.activeTab = tab.slug;
        this.cdr.detectChanges();
        this.router.navigate([tab.slug === 'smeri' ? {} : { tab: tab.slug }], {
            relativeTo: this.activatedRoute
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
                        user: this.user
                    },
                    autoFocus: false
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
                            icon: 'photo'
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
                        type: type
                    },
                    autoFocus: false
                });
            }
        });
    }

    onImageClicked() {
        this.setActiveTab({
            slug: 'galerija',
            label: 'Galerija',
            icon: 'photo'
        });
    }
}
