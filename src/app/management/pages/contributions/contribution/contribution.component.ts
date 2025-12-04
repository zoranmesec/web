import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';
import { User } from '@sentry/angular';
import { FlexLayoutModule } from 'ng-flex-layout';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { Contribution } from 'src/generated/graphql';
import { ContributionService } from './contribution.service';

@Component({
    selector: 'app-contribution',
    templateUrl: './contribution.component.html',
    styleUrls: ['./contribution.component.scss'],
    imports: [RouterModule, MatCardModule, FlexLayoutModule, MatButtonModule]
})
export class ContributionComponent implements OnInit, OnDestroy {
    @Input() contribution: Contribution;
    @Input() link: string[];
    @Input() depth = 0;

    entityTypeLabel = { crag: 'Plezališče', sector: 'Sektor', route: 'Smer' };

    user: User;
    subscription: Subscription;

    constructor(
        private authService: AuthService,
        public contributionService: ContributionService
    ) {}

    ngOnInit(): void {
        this.subscription = this.authService.currentUser.subscribe((user) => {
            this.user = user;
        });
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }
}
