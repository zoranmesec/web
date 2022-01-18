import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { param } from 'jquery';
import { filter, of, Subscription, switchMap, take } from 'rxjs';
import { LayoutService } from 'src/app/services/layout.service';
import {
  Crag,
  ManagementGetCragGQL,
  ManagementGetCragQuery,
} from 'src/generated/graphql';
import { CragAdminBreadcrumbs } from '../../utils/crag-admin-breadcrumbs';

@Component({
  selector: 'app-crag',
  templateUrl: './crag.component.html',
  styleUrls: ['./crag.component.scss'],
})
export class CragComponent implements OnInit {
  loading: boolean = true;
  heading: string = '';

  crag: Crag;

  subscriptions: Subscription[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private layoutService: LayoutService,
    private managementGetCragGQL: ManagementGetCragGQL
  ) {}

  ngOnInit(): void {
    this.activatedRoute.params
      .pipe(
        filter((params) => params.crag != null),
        switchMap((params) => {
          if (params.crag != null) {
            return this.managementGetCragGQL.fetch({
              id: params.crag,
            });
          } else {
            return of(null);
          }
        })
      )
      .subscribe((result) => {
        if (result != null) {
          this.crag = <Crag>result.data.crag;

          this.layoutService.$breadcrumbs.next(
            new CragAdminBreadcrumbs(this.crag).build()
          );

          this.heading = `${this.crag.name}`;
        } else {
          this.layoutService.$breadcrumbs.next([
            {
              name: 'Dodajanje plezališča',
            },
          ]);
          this.heading = `Dodajanje plezališča`;
        }
        this.loading = false;
      });
  }
}
