import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';
import { map, of, Subscription, switchMap } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { PluralizeNoun } from 'src/app/shared/pipes/pluralize-noun.pipe';
import { PluralizeVerb } from 'src/app/shared/pipes/pluralize-verb.pipe';
import { Contribution, PendingContributionsGQL } from 'src/generated/graphql';
import { LoadingSpinnerService } from '../loading-spinner.service';

@Component({
    selector: 'app-pending-contributions-hints',
    templateUrl: './pending-contributions-hints.component.html',
    styleUrls: ['./pending-contributions-hints.component.scss'],
    imports: [PluralizeNoun, MatCardModule, RouterModule, PluralizeVerb],
    providers: [PluralizeNoun, PluralizeVerb]
})
export class PendingContributionsHintsComponent implements OnInit, OnDestroy {
    isAdmin = false;
    pendingDrafts: Contribution[];
    pendingInReviews: Contribution[];

    subscription: Subscription;

    constructor(
        private authService: AuthService,
        public loadingSpinnerService: LoadingSpinnerService,
        private pendingContributionsGQL: PendingContributionsGQL
    ) {}

    ngOnInit(): void {
        this.subscription = this.authService.currentUser
            .pipe(
                switchMap((user) => {
                    if (!user) {
                        return of(null);
                    } else {
                        return this.pendingContributionsGQL.fetch().pipe(
                            map((response) => ({
                                user,
                                contributions: response.data.contributions
                            }))
                        );
                    }
                })
            )
            .subscribe((userAndContributions) => {
                if (userAndContributions) {
                    const { user, contributions } = userAndContributions;
                    this.pendingDrafts = contributions.filter((contribution) => contribution.publishStatus === 'draft');

                    this.pendingInReviews = contributions.filter(
                        (contribution: Contribution) => contribution.publishStatus === 'in_review'
                    );

                    this.isAdmin = user.roles.includes('admin');
                } else {
                    this.pendingDrafts = [];
                    this.pendingInReviews = [];
                    this.isAdmin = false;
                }
            });
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }
}
