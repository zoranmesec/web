import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { QueryRef } from 'apollo-angular';
import { Subject, Subscription, switchMap } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { CommentFormComponent } from 'src/app/shared/components/comment-form/comment-form.component';
import { ImageUploadComponent } from 'src/app/shared/components/image-upload/image-upload.component';
import { GradingSystemsService } from 'src/app/shared/services/grading-systems.service';
import {
    Comment,
    DifficultyVote,
    Exact,
    Route,
    RouteBySlugGQL,
    RouteBySlugQuery,
    Scalars,
    StarRatingVote,
    User
} from 'src/generated/graphql';
import { LayoutService } from '../../services/layout.service';
import { DataError } from '../../types/data-error';

import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { FlexLayoutModule } from 'ng-flex-layout';
import { BreakpointService } from 'src/app/services/breakpoint.service';
import { DataErrorComponent } from 'src/app/shared/components/data-error/data-error.component';
import { LoaderComponent } from 'src/app/shared/components/loader/loader.component';
import { PublishStatusHintComponent } from 'src/app/shared/components/publish-status-hint/publish-status-hint.component';
import { TitleComponent } from 'src/app/shared/components/title/title.component';
import { WarningsComponent } from 'src/app/shared/components/warnings/warnings.component';
import { IconsModule } from 'src/app/shared/icons/icons.module';
import { CragGalleryComponent } from '../crag/crag-gallery/crag-gallery.component';
import { RouteAscentsComponent } from './route-ascents/route-ascents.component';
import { RouteCommentsComponent } from './route-comments/route-comments.component';
import { RouteGradesComponent } from './route-grades/route-grades.component';
import { RouteInfoComponent } from './route-info/route-info.component';
import { RouteStarRatingsComponent } from './route-star-ratings/route-star-ratings.component';

@Component({
    selector: 'app-route',
    templateUrl: './route.component.html',
    styleUrls: ['./route.component.scss'],
    standalone: true,
    imports: [
        LoaderComponent,
        DataErrorComponent,
        FlexLayoutModule,
        MatIconModule,
        PublishStatusHintComponent,
        WarningsComponent,
        RouteInfoComponent,
        CragGalleryComponent,
        RouteCommentsComponent,
        MatMenuModule,
        MatButtonModule,
        RouterModule,
        RouteGradesComponent,
        RouteAscentsComponent,
        MatExpansionModule,
        RouteStarRatingsComponent,
        RouterModule,
        IconsModule,
        TitleComponent
    ]
})
export class RouteComponent implements OnInit, OnDestroy {
    loading = true;
    error: DataError = null;
    route: Route;
    warnings: Comment[];

    section: string;

    action$ = new Subject<string>();
    actionSubscription: Subscription;
    routeQuerySubscription: Subscription;

    user: User;
    userSubscription: Subscription;
    grades: DifficultyVote[] = [];
    votes: StarRatingVote[] = [];
    routeQuery: QueryRef<
        RouteBySlugQuery,
        Exact<{
            cragSlug: Scalars['String']['input'];
            routeSlug: Scalars['String']['input'];
        }>
    >;

    constructor(
        private readonly router: Router,
        private readonly activatedRoute: ActivatedRoute,
        private readonly layoutService: LayoutService,
        private readonly authService: AuthService,
        private readonly dialog: MatDialog,
        private readonly routeBySlugGQL: RouteBySlugGQL,
        private readonly gradingSystemService: GradingSystemsService,
        private readonly breakpointService: BreakpointService,
        private readonly cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.userSubscription = this.authService.currentUser.subscribe((user) => (this.user = user));
        this.section = this.router.url.includes('/alpinizem/stena') ? 'alpinism' : 'sport';

        this.routeQuerySubscription = this.activatedRoute.params
            .pipe(
                switchMap((params) => {
                    this.loading = true;
                    this.routeQuery = this.routeBySlugGQL.watch({
                        variables: { cragSlug: params.crag, routeSlug: params.route }
                    });
                    return this.routeQuery.valueChanges;
                })
            )
            .subscribe({
                next: (result) => {
                    if (result.data !== undefined) {
                        this.loading = false;
                        this.querySuccess(result.data as RouteBySlugQuery);
                        this.cdr.markForCheck();
                    }
                },
                error: (error) => {
                    this.loading = false;
                    this.queryError(error);
                }
            });

        this.actionSubscription = this.action$.subscribe((action) => {
            switch (action) {
                case 'add-comment':
                    this.addComment('comment');
                    break;
                case 'add-condition':
                    this.addComment('condition');
                    break;
                case 'add-description':
                    this.addComment('description');
                    break;
            }
        });
    }

    get routeImage() {
        return this.route?.images[0] || [];
    }

    get previousRoute() {
        if (!this.route) {
            return null;
        }
        const routeIndex = this.route.sector.crag.routes.findIndex((r) => r.id === this.route.id);
        return routeIndex > 0 ? this.route.sector.crag.routes[routeIndex - 1] : null;
    }

    get nextRoute() {
        if (!this.route) {
            return null;
        }
        const routeIndex = this.route.sector.crag.routes.findIndex((r) => r.id === this.route.id);
        return routeIndex < this.route.sector.crag.routes.length - 1 ? this.route.sector.crag.routes[routeIndex + 1] : null;
    }

    async addImage() {
        const allowed = await this.authService.guardedAction({});
        if (allowed) {
            this.dialog
                .open(ImageUploadComponent, {
                    data: {
                        entityType: 'route',
                        entityId: this.route.id,
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
                    this.routeQuery.refetch();
                });
        }
    }

    addComment(type: string) {
        this.authService.guardedAction({}).then((success) => {
            if (success) {
                this.dialog.open(CommentFormComponent, {
                    data: {
                        route: this.route,
                        type
                    },
                    autoFocus: false
                });
            }
        });
    }

    queryError(error: Error): void {
        if (error.message === 'entity_not_found') {
            this.error = {
                message: 'Smer ne obstaja v bazi.'
            };
            return;
        }

        this.error = {
            message: 'Prišlo je do nepričakovane napake pri zajemu podatkov.'
        };
    }

    querySuccess(data: RouteBySlugQuery): void {
        this.route = data.routeBySlug as Route;
        this.warnings = this.route?.comments.filter((comment) => comment.type === 'warning');

        this.grades = this.route.difficultyVotes.slice();
        this.grades.sort((a, b) => a.difficulty - b.difficulty);

        this.votes = this.route.starRatingVotes.slice();
        this.votes.sort((a, b) => a.created - b.created);

        if (this.section === 'alpinism') {
            this.layoutService.$breadcrumbs.next([
                {
                    name: 'Alpinizem',
                    path: '/alpinizem'
                },
                {
                    name: 'Vrhovi',
                    path: '/alpinizem/vrhovi'
                },
                {
                    name: this.route.sector.crag.country.name,
                    path: `/alpinizem/vrhovi/${this.route.sector.crag.country.slug}`
                },
                {
                    name: this.route.sector.crag.peak.name,
                    path: `/alpinizem/vrhovi/vrh/${this.route.sector.crag.peak.slug}`
                },
                {
                    name: this.route.sector.crag.name,
                    path: `/alpinizem/stena/${this.route.sector.crag.slug}`
                },
                {
                    name: this.route.name
                }
            ]);
        } else {
            this.layoutService.$breadcrumbs.next([
                {
                    name: 'Plezališča',
                    path: '/plezalisca'
                },
                {
                    name: this.route.sector.crag.country.name,
                    path: `/plezalisca/${this.route.sector.crag.country.slug}`
                },
                {
                    name: this.route.sector.crag.name,
                    path: `/plezalisce/${this.route.sector.crag.slug}`
                },
                {
                    name: this.route.name
                }
            ]);

            this.layoutService.setTitle([this.route.name, `Smer v plezališču ${this.route.sector.crag.name}`]);

            this.gradingSystemService.diffToGrade(this.route.difficulty, this.route.defaultGradingSystem.id).then((grade) => {
                this.layoutService.setDescription(
                    `${this.route.name}; Plezališče ${this.route.sector.crag.name}; Težavnost: ${grade.name}; Dolžina: ${this.route.length}`
                );
            });
        }
    }

    ngOnDestroy(): void {
        this.routeQuerySubscription.unsubscribe();
        this.actionSubscription.unsubscribe();
        this.userSubscription.unsubscribe();
    }
}
