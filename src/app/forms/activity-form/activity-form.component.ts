import { Component, OnInit, Input } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CreateActivityGQL, namedOperations } from 'src/generated/graphql';
import moment from 'moment';
import { Router } from '@angular/router';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { PublishOptionsEnum } from 'src/app/common/activity.constants';

@Component({
  selector: 'app-activity-form',
  templateUrl: './activity-form.component.html',
  styleUrls: ['./activity-form.component.scss'],
})
export class ActivityFormComponent implements OnInit {
  loading: boolean = false;

  routes = new FormArray([]);

  routeData = [];

  activityForm = new FormGroup({
    date: new FormControl(moment()),
    partners: new FormControl(),
    notes: new FormControl(),
    onlyRoutes: new FormControl(false),
    routes: this.routes,
  });

  @Input() crag;
  @Input() selectedRoutes;

  constructor(
    private snackBar: MatSnackBar,
    private createActivityGQL: CreateActivityGQL,
    private router: Router,
    private localStorageService: LocalStorageService
  ) {}

  ngOnInit(): void {
    if (this.selectedRoutes.length) {
      this.selectedRoutes.forEach((route) => {
        this.addRoute(route);
      });
    }

    this.activityForm.controls.date.valueChanges.subscribe((value) => {
      this.patchRouteDates(value);
    });

    this.activityForm.controls.onlyRoutes.valueChanges.subscribe((value) => {
      if (!value) {
        this.patchRouteDates(this.activityForm.value.date);
      }
    });

    this.activityForm.patchValue({ date: moment() });
  }

  patchRouteDates(value: moment.Moment): void {
    this.routes.controls.forEach((control) =>
      control.patchValue({ date: value })
    );
  }

  addRoute(route: any): void {
    this.routes.push(
      new FormGroup({
        routeId: new FormControl(route.id),
        name: new FormControl(route.name),
        grade: new FormControl(route.grade),
        difficulty: new FormControl(route.difficulty),
        ascentType: new FormControl(!route?.ticked ? 'redpoint' : 'repeat'),
        date: new FormControl(),
        partner: new FormControl(),
        publish: new FormControl('public'),
        notes: new FormControl(),
        stars: new FormControl(),
        gradeSuggestion: new FormControl(),
      })
    );
    // TODO: push only one array to child component?
    this.routeData.push({
      route,
    });
  }

  moveRoute(routeIndex: number, direction: number): void {
    if (direction === 0) {
      this.routes.controls.splice(routeIndex, 1);
      return;
    }

    if (direction === 2) {
      this.routes.controls.splice(
        routeIndex,
        0,
        this.routes.controls[routeIndex]
      );
      return;
    }

    const temp = this.routes.controls[routeIndex + direction];

    this.routes.controls[routeIndex + direction] =
      this.routes.controls[routeIndex];
    this.routes.controls[routeIndex] = temp;
  }

  add(): boolean {
    this.addRoute({});
    return false;
  }

  save(): void {
    const data = this.activityForm.value;

    this.loading = true;
    this.activityForm.disable();

    const activity = {
      date: moment(data.date).format('YYYY-MM-DD'),
      name: this.crag.name,
      type: 'crag', // TODO: resolve from parameters
      notes: data.notes,
      partners: data.partners,
      cragId: this.crag.id,
    };

    console.log(this.routes.value);

    const routes = this.routes.value.map((route: any, i: number) => {
      return {
        date: route.date || activity.date,
        partner: route.partner || activity.partners,
        ascentType: route.ascentType,
        notes: route.notes,
        position: i,
        publish: route.publish,
        routeId: route.routeId,
        name: route.name,
        difficulty: route.difficulty,
        grade:
          route.publish === PublishOptionsEnum.private
            ? undefined
            : route.gradeSuggestion,
        stars: route.stars,
      };
    });

    console.log(routes);

    this.createActivityGQL
      .mutate(
        { input: activity, routes },
        {
          refetchQueries: [
            namedOperations.Query.MyActivities,
            namedOperations.Query.MyActivityRoutes,
          ],
        }
      )
      .subscribe(
        () => {
          this.localStorageService.removeItem('activity-selection');
          this.snackBar.open('Vnos je bil shranjen v plezalni dnevnik', null, {
            duration: 3000,
          });
          this.router.navigate(['/plezalni-dnevnik']);
        },
        (error) => {
          this.loading = false;
          this.activityForm.enable();
          this.snackBar.open(
            'Vnosa ni bilo mogoče shraniti v plezalni dnevnik',
            null,
            { panelClass: 'error', duration: 3000 }
          );
        }
      );
  }
}
