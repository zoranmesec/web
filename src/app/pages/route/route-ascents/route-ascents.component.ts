import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnChanges, OnDestroy, input } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { MyActivityRoutesGQL, MyActivityRoutesQuery, Route, RouteActivitiesGQL, RouteActivitiesQuery, User } from 'src/generated/graphql';

import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';

import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { AscentTypeComponent } from 'src/app/shared/components/ascent-type/ascent-type.component';
import { LoaderComponent } from 'src/app/shared/components/loader/loader.component';
import { DataError } from 'src/app/types/data-error';

@Component({
    selector: 'app-route-ascents',
    templateUrl: './route-ascents.component.html',
    styleUrls: ['./route-ascents.component.scss'],
    standalone: true,
    imports: [CommonModule, MatExpansionModule, MatIconModule, AscentTypeComponent, MatPaginatorModule, LoaderComponent],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RouteAscentsComponent implements OnDestroy, OnChanges {
    route = input.required<Route>();
    showOnlyUserAscents = input.required<boolean>();

    protected loading = true;
    error: DataError = null;
    user: User;
    subscriptions = [];
    ascents: MyActivityRoutesQuery['myActivityRoutes']['items'] | RouteActivitiesQuery['routeActivities']['items'] = [];
    pagination: MyActivityRoutesQuery['myActivityRoutes']['meta'];
    constructor(
        private authService: AuthService,
        private myActivityRoutesGQL: MyActivityRoutesGQL,
        private routeActivitiesGQL: RouteActivitiesGQL,
        private readonly cdr: ChangeDetectorRef
    ) {}

    ngOnChanges(): void {
        const userSub = this.authService.currentUser.subscribe((user) => (this.user = user));

        if (this.showOnlyUserAscents()) {
            const userAscentsSub = this.myActivityRoutesGQL
                .watch({ variables: { input: { routeId: this.route().id } } })
                .valueChanges.subscribe((result) => {
                    if (result.data !== undefined) {
                        this.ascents = result.data.myActivityRoutes.items as MyActivityRoutesQuery['myActivityRoutes']['items'];
                        this.pagination = result.data.myActivityRoutes.meta as MyActivityRoutesQuery['myActivityRoutes']['meta'];
                        this.loading = false;
                        this.cdr.markForCheck();
                    }
                });
            this.subscriptions.push(userAscentsSub);
        } else {
            const publicAscentsSub = this.routeActivitiesGQL
                .watch({ variables: { input: { routeId: this.route().id } } })
                .valueChanges.subscribe((result) => {
                    if (result.data !== undefined) {
                        this.ascents = result.data.routeActivities.items as RouteActivitiesQuery['routeActivities']['items'];
                        this.pagination = result.data.routeActivities.meta as RouteActivitiesQuery['routeActivities']['meta'];
                        this.loading = false;
                        this.cdr.markForCheck();
                    }
                });
            this.subscriptions.push(publicAscentsSub);
        }

        this.subscriptions.push(userSub);
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((s) => s.unsubscribe());
    }

    protected paginate(event: PageEvent) {
        this.loading = true;
        if (this.showOnlyUserAscents()) {
            this.myActivityRoutesGQL
                .watch({
                    variables: {
                        input: {
                            routeId: this.route().id,
                            pageNumber: event.pageIndex + 1,
                            pageSize: event.pageSize
                        }
                    }
                })
                .valueChanges.subscribe((result) => {
                    if (result.data !== undefined) {
                        this.ascents = result.data.myActivityRoutes.items as MyActivityRoutesQuery['myActivityRoutes']['items'];
                        this.pagination = result.data.myActivityRoutes.meta as MyActivityRoutesQuery['myActivityRoutes']['meta'];
                        this.loading = false;
                        this.cdr.markForCheck();
                    }
                });
        } else {
            this.routeActivitiesGQL
                .watch({
                    variables: {
                        input: {
                            routeId: this.route().id,
                            pageNumber: event.pageIndex + 1,
                            pageSize: event.pageSize
                        }
                    }
                })
                .valueChanges.subscribe((result) => {
                    if (result.data !== undefined) {
                        this.ascents = result.data.routeActivities.items as RouteActivitiesQuery['routeActivities']['items'];
                        this.pagination = result.data.routeActivities.meta as RouteActivitiesQuery['routeActivities']['meta'];
                        this.loading = false;
                        this.cdr.markForCheck();
                    }
                });
        }
    }
}
