import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, of, Subscription, switchMap } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { LayoutService } from 'src/app/services/layout.service';
import { Crag, ManagementGetCragGQL } from 'src/generated/graphql';
import { CragAdminBreadcrumbs } from '../../utils/crag-admin-breadcrumbs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FlexLayoutModule } from 'ng-flex-layout';
import { CragFormComponent } from '../../forms/crag-form/crag-form.component';
import { Tab } from 'src/app/types/tab';
import { IconsModule } from 'src/app/shared/icons/icons.module';

@Component({
  selector: 'app-crag',
  templateUrl: './crag.component.html',
  styleUrls: ['./crag.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    FlexLayoutModule,
    CragFormComponent,
    IconsModule,
  ],
})
export class CragComponent implements OnInit, OnDestroy {
  loading: boolean = true;
  error: boolean = false;
  heading: string = '';
  protected isSaved: boolean = false;

  tabs: Array<Tab> = [
    {
      slug: 'osnovni-podatki',
      label: 'Osnovni podatki',
      icon: 'info',
    },
    {
      slug: 'sektorji-in-smeri',
      label: 'Sektorji in smeri',
      icon: 'routes',
    },
  ];

  activeTab: string = 'osnovni-podatki';

  crag: Crag;

  subscriptions: Subscription[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private layoutService: LayoutService,
    private managementGetCragGQL: ManagementGetCragGQL
  ) {}

  get isDisabledTab(): boolean {
    return this.activeTab === 'osnovni-podatki' && this.crag == null;
  }

  ngOnInit(): void {
    const sub = this.activatedRoute.params
      .pipe(
        switchMap((params) =>
          params.crag != null
            ? this.managementGetCragGQL.watch({
                variables: { id: params.crag },
              }).valueChanges
            : of(null)
        )
      )
      .subscribe({
        next: (result) => {
          if (result == null) {
            this.layoutService.$breadcrumbs.next([
              {
                name: 'Dodajanje plezališča',
              },
            ]);
            this.heading = `Dodajanje plezališča`;
            this.loading = false;
            return;
          }

          this.crag = <Crag>result.data.crag;

          this.layoutService.$breadcrumbs.next(
            new CragAdminBreadcrumbs(this.crag).build()
          );
          this.heading = `${this.crag.name}`;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.error = true;
        },
      });

    this.subscriptions.push(sub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
