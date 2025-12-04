import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ObservableQuery } from '@apollo/client';
import { QueryRef } from 'apollo-angular';
import { Subscription } from 'rxjs';
import { ClubFormComponent } from 'src/app/forms/club-form/club-form.component';
import { LayoutService } from 'src/app/services/layout.service';
import { DataError } from 'src/app/types/data-error';
import { Club, Exact, MyClubsGQL, MyClubsQuery } from '../../../generated/graphql';

@Component({
    selector: 'app-clubs',
    templateUrl: './clubs.component.html',
    styleUrls: ['./clubs.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
export class ClubsComponent implements OnInit, OnDestroy {
    myClubs: Club[] = [];
    loading = true;
    error: DataError = null;

    myClubsSubscription: Subscription;
    myClubsQuery: QueryRef<MyClubsQuery, Exact<Record<string, never>>>;

    constructor(
        private layoutService: LayoutService,
        private myClubsGQL: MyClubsGQL,
        private dialog: MatDialog
    ) {}

    ngOnInit(): void {
        this.myClubsQuery = this.myClubsGQL.watch();
        this.myClubsSubscription = this.myClubsQuery.valueChanges.subscribe(
            (result: ObservableQuery.Result<MyClubsQuery, 'empty' | 'complete' | 'streaming' | 'partial'>) => {
                if (result.data !== undefined) {
                    this.querySuccess(result.data as MyClubsQuery);
                    this.loading = false;
                }

                if (result.error !== null) {
                    this.error = {
                        message: 'Prišlo je do nepričakovane napake pri zajemu podatkov.'
                    };
                }
            }
        );
    }

    querySuccess(data: MyClubsQuery) {
        this.myClubs = data.myClubs as Club[];

        this.layoutService.$breadcrumbs.next([
            {
                name: 'Moj Profil',
                path: '/moj-profil'
            },
            {
                name: 'Moji Klubi'
            }
        ]);
    }

    createClub() {
        this.dialog
            .open(ClubFormComponent)
            .afterClosed()
            .subscribe(() => {
                this.myClubsQuery.refetch();
            });
    }

    ngOnDestroy() {
        this.myClubsSubscription.unsubscribe();
    }
}
