import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';
import { FlexLayoutModule } from 'ng-flex-layout';
import { of, Subscription, switchMap } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { BreakpointService } from 'src/app/services/breakpoint.service';
import { LayoutService } from 'src/app/services/layout.service';
import { TitleComponent } from 'src/app/shared/components/title/title.component';
import { IconsModule } from 'src/app/shared/icons/icons.module';
import { Tab } from 'src/app/types/tab';
import { Crag, ManagementGetCragGQL } from 'src/generated/graphql';
import { CragFormComponent } from '../../forms/crag-form/crag-form.component';
import { CragAdminBreadcrumbs } from '../../utils/crag-admin-breadcrumbs';

@Component({
    selector: 'app-crag',
    templateUrl: './crag.component.html',
    styleUrls: ['./crag.component.scss'],
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, MatButtonModule, FlexLayoutModule, CragFormComponent, IconsModule, TitleComponent]
})
export class CragComponent implements OnInit, OnDestroy {
    loading = true;
    error = false;
    heading = '';
    protected isSaved = false;

    tabs: Tab[] = [
        {
            slug: 'osnovni-podatki',
            label: 'Osnovni podatki',
            icon: 'info'
        },
        {
            slug: 'sektorji',
            label: 'Sektorji in smeri',
            icon: 'routes'
        }
    ];

    activeTab = 'osnovni-podatki';

    crag: Crag;

    subscriptions: Subscription[] = [];

    constructor(
        private activatedRoute: ActivatedRoute,
        private authService: AuthService,
        private layoutService: LayoutService,
        private managementGetCragGQL: ManagementGetCragGQL,
        private readonly router: Router,
        protected readonly breakpointService: BreakpointService
    ) {}

    ngOnInit(): void {
        const sub = this.activatedRoute.params
            .pipe(
                switchMap((params) =>
                    params.crag !== undefined
                        ? this.managementGetCragGQL.watch({
                              variables: { id: params.crag }
                          }).valueChanges
                        : of(undefined)
                )
            )
            .subscribe({
                next: (result) => {
                    console.log('CRAG RESULT', result);
                    if (result === undefined) {
                        this.layoutService.$breadcrumbs.next([
                            {
                                name: 'Dodajanje plezališča'
                            }
                        ]);
                        this.heading = `Dodajanje plezališča`;
                        this.loading = false;
                        return;
                    } else if (result.data !== undefined) {
                        console.log('CRAG DATA', result.data);
                        this.crag = result.data.crag as Crag;

                        this.layoutService.$breadcrumbs.next(new CragAdminBreadcrumbs(this.crag).build());
                        this.heading = `${this.crag.name}`;
                    }

                    this.loading = false;
                },
                error: () => {
                    this.loading = false;
                    this.error = true;
                }
            });

        this.subscriptions.push(sub);
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((sub) => sub.unsubscribe());
    }

    protected async goToSectors(): Promise<void> {
        if (this.crag !== undefined) {
            await this.router.navigate(['sektorji'], { relativeTo: this.activatedRoute });
        }
    }
}
