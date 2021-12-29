import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Apollo, gql } from 'apollo-angular';
import { DataError } from '../../types/data-error';
import { LayoutService } from '../../services/layout.service';
import { RouteBySlugGQL, RouteBySlugQuery } from 'src/generated/graphql';

@Component({
  selector: 'app-route',
  templateUrl: './route.component.html',
  styleUrls: ['./route.component.scss'],
})
export class RouteComponent implements OnInit {
  loading: boolean = true;
  error: DataError = null;
  route: RouteBySlugQuery['routeBySlug'];
  warnings: RouteBySlugQuery['routeBySlug']['comments'];

  constructor(
    private activatedRoute: ActivatedRoute,
    private layoutService: LayoutService,
    private routeBySlugGQL: RouteBySlugGQL
  ) {}

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params: Params) => {
      this.routeBySlugGQL
        .watch({
          cragSlug: params.crag,
          routeSlug: params.route,
        })
        .valueChanges.subscribe((result) => {
          this.loading = false;

          if (result.errors != null) {
            this.queryError(result.errors);
          } else {
            this.querySuccess(result.data);
          }
        });
    });
  }

  queryError(errors: any): void {
    if (errors.length > 0 && errors[0].message === 'entity_not_found') {
      this.error = {
        message: 'Smer ne obstaja v bazi.',
      };

      return;
    }

    this.error = {
      message: 'Prišlo je do nepričakovane napake pri zajemu podatkov.',
    };
  }

  querySuccess(data: RouteBySlugQuery): void {
    this.route = data.routeBySlug;
    this.warnings = this.route?.comments.filter(
      (comment) => comment.type === 'warning'
    );

    this.layoutService.$breadcrumbs.next([
      {
        name: 'Plezališča',
        path: '/plezalisca',
      },
      {
        name: this.route.sector.crag.country.name,
        path: `/plezalisca/${this.route.sector.crag.country.slug}`,
      },
      {
        name: this.route.sector.crag.name,
        path: `/plezalisca/${this.route.sector.crag.country.slug}/${this.route.sector.crag.slug}`,
      },
      {
        name: this.route.name,
      },
    ]);
  }
}
