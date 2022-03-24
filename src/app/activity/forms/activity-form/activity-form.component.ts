import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  Crag,
  CreateActivityGQL,
  IceFall,
  Peak,
  Route,
} from 'src/generated/graphql';
import dayjs from 'dayjs';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { ActivityFormService } from './activity-form.service';
import { filter } from 'rxjs';
import { Subscription } from 'rxjs';
import { ACTIVITY_TYPES } from 'src/app/common/activity.constants';
import { Location } from '@angular/common';

@Component({
  selector: 'app-activity-form',
  templateUrl: './activity-form.component.html',
  styleUrls: ['./activity-form.component.scss'],
})
export class ActivityFormComponent implements OnInit, OnDestroy {
  @Input() type: string;
  @Input() crag: Crag;
  @Input() selectedRoutes: Route[];
  @Input() peak: Peak;
  @Input() iceFall: IceFall;

  loading: boolean = false;

  routes = new FormArray([]);

  typeOptions = ACTIVITY_TYPES.filter(
    (type) => type.value != 'iceFall' && type.value != 'peak'
  );

  activityForm = new FormGroup({
    type: new FormControl(null, Validators.required),
    name: new FormControl(''),
    cragId: new FormControl(null),
    peakId: new FormControl(null),
    iceFallId: new FormControl(null),
    duration: new FormControl(null),
    date: new FormControl('2021-01-01'),
    partners: new FormControl(),
    notes: new FormControl(),
    onlyRoutes: new FormControl(false),
    routes: this.routes,
  });

  afMutex = false;

  subscriptions: Subscription[] = [];

  constructor(
    private snackBar: MatSnackBar,
    private createActivityGQL: CreateActivityGQL,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public location: Location,
    private localStorageService: LocalStorageService,
    private activityFormService: ActivityFormService
  ) {}

  ngOnInit(): void {
    if (this.selectedRoutes.length) {
      this.selectedRoutes.forEach((route) => {
        this.addRoute(route);
      });
    }

    // first time emmits, when activity form date is patched bellow
    // ui prevents it, but should probably check the state of the onlyroutes checkbox first?
    this.activityForm.controls.date.valueChanges.subscribe((value) => {
      this.patchRouteDates(value);
    });

    this.activityForm.controls.onlyRoutes.valueChanges.subscribe((value) => {
      if (!value) {
        this.patchRouteDates(this.activityForm.value.date);
      }
    });

    this.activityForm.patchValue({
      date: dayjs().format('YYYY-MM-DD'),
      type: this.type,
    });

    if (this.crag != null) {
      this.activityForm.patchValue({
        name: this.crag.name,
        cragId: this.crag.id,
      });
    }

    this.activityFormService.initialize(this.routes);
    this.activityForm.valueChanges
      .pipe(filter(() => !this.afMutex))
      .subscribe(() => {
        this.afMutex = true;
        this.activityFormService.conditionallyDisableVotedDifficultyInputs();
        this.afMutex = false;
      });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  patchRouteDates(value: dayjs.Dayjs): void {
    this.routes.controls.forEach((control) =>
      control.patchValue({ date: value })
    );
  }

  addRoute(route: any): void {
    this.routes.push(
      new FormGroup({
        routeId: new FormControl(route.id),
        name: new FormControl(route.name),
        slug: new FormControl(route.slug),
        difficulty: new FormControl(route.difficulty),
        defaultGradingSystemId: new FormControl(route.defaultGradingSystem.id),
        isProject: new FormControl(route.isProject),
        ascentType: new FormControl(!route?.ticked ? 'redpoint' : 'repeat', [
          Validators.required,
        ]),
        date: new FormControl(),
        partner: new FormControl(),
        publish: new FormControl('public'),
        notes: new FormControl(),
        votedStarRating: new FormControl(),
        votedDifficulty: new FormControl(),
        ticked: new FormControl(route.ticked),
        tried: new FormControl(route.tried),
        trTicked: new FormControl(route.trTicked),
        type: new FormControl(route.routeType.id),
      })
    );
  }

  moveRoute(routeIndex: number, direction: number): void {
    switch (direction) {
      case 0:
        // delete the route at routeIndex
        this.routes.removeAt(routeIndex);
        break;
      case 2:
        // add a copy of the same route
        const routeFormGroupOriginal = <FormGroup>this.routes.at(routeIndex);
        const routeFormGroupCopy = this.copyFormFroup(routeFormGroupOriginal);
        this.routes.insert(routeIndex + 1, routeFormGroupCopy);
        break;
      default:
        // switch position of adjacent routes
        const temp = this.routes.controls[routeIndex + direction];
        this.routes.controls[routeIndex + direction] =
          this.routes.controls[routeIndex];
        this.routes.controls[routeIndex] = temp;
    }
  }

  private copyFormFroup(formGroupOriginal: FormGroup) {
    const formGroupData = Object.keys(formGroupOriginal.controls).reduce(
      (fgData, key) => {
        fgData[key] = new FormControl(
          formGroupOriginal.get(key).value,
          formGroupOriginal.get(key).validator
        );
        return fgData;
      },
      {}
    );
    return new FormGroup(formGroupData);
  }

  save(): void {
    const data = this.activityForm.value;

    this.loading = true;

    this.activityForm.disable({ emitEvent: false });

    const activity = {
      date: dayjs(data.date).format('YYYY-MM-DD'),
      name: data.name,
      duration: data.duration,
      type: data.type,
      notes: data.notes,
      partners: data.partners,
      cragId: data.cragId,
      peakId: data.peakId,
      iceFallId: data.iceFallId,
    };

    const routes = this.routes.value.map((route: any, i: number) => {
      return {
        date: route.date
          ? dayjs(route.date).format('YYYY-MM-DD')
          : activity.date,
        partner: route.partner || activity.partners,
        notes: route.notes,
        routeId: route.routeId,
        ascentType: route.ascentType,
        votedStarRating: route.votedStarRating,
        publish: route.publish,
        votedDifficulty: route.votedDifficulty,
        position: i, // position of the route within the same activity of ones log
      };
    });

    this.createActivityGQL.mutate({ input: activity, routes }).subscribe({
      next: () => {
        if (this.crag) {
          this.successCragWithRoutes();
          return;
        }
        this.snackBar.open('Vnos je bil shranjen v plezalni dnevnik', null, {
          duration: 3000,
        });
        this.router.navigate(['/plezalni-dnevnik']);
      },
      error: () => {
        this.loading = false;
        this.activityForm.enable();
        this.snackBar.open(
          'Vnosa ni bilo mogoče shraniti v plezalni dnevnik',
          null,
          { panelClass: 'error', duration: 3000 }
        );
      },
    });
  }

  successCragWithRoutes() {
    this.localStorageService.removeItem('activity-selection');
    this.snackBar
      .open('Vnos je bil shranjen v plezalni dnevnik', 'Odpri dnevnik', {
        duration: 3000,
      })
      .onAction()
      .subscribe(() => {
        if (this.crag) {
          this.router.navigate(['/plezalni-dnevnik']);
        }
      });

    // based on crag type navigate back to either peaks(alpinism) or sport climbing section
    if (this.crag.type === 'alpine') {
      this.router.navigate(['/alpinizem', 'stena', this.crag.slug]);
    } else {
      this.router.navigate(['/plezalisce/', this.crag.slug]);
    }
  }
}