import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  CountriesTocGQL,
  CountriesTocQuery,
  Country,
} from '../../../../generated/graphql';
import { ROUTE_TYPES } from 'src/app/common/route-types.constants';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { FlexLayoutModule } from 'ng-flex-layout';
import { ORIENTATIONS } from 'src/app/common/orientation.constants';
import { MatInputModule } from '@angular/material/input';
import { GradeSelectComponent } from 'src/app/shared/components/grade-select/grade-select.component';
import { IconsModule } from 'src/app/shared/icons/icons.module';
@Component({
  selector: 'app-crags-toc',
  templateUrl: './crags-toc.component.html',
  styleUrls: ['./crags-toc.component.scss'],
  imports: [
    MatIcon,
    MatOptionModule,
    CommonModule,
    MatButtonModule,
    MatExpansionModule,
    MatCheckboxModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MatInputModule,
    GradeSelectComponent,
    IconsModule,
  ],
})
export class CragsTocComponent implements OnInit, OnDestroy, OnChanges {
  @Input() country: Country;
  @Output() close = new EventEmitter<void>();
  countries: CountriesTocQuery['countries'];

  showAllCountries: boolean = false;
  currentCountrySlug: string | undefined = undefined;
  subscriptions: Subscription[] = [];
  grades: any;
  activatedMinGrade: string | null = null;
  activatedMaxGrade: string | null = null;

  ngOnDestroy(): void {
    Object.entries(this.cragForm.controls).forEach(([key, control]) => {
      control.reset();
    });
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
  cragForm!: FormGroup;
  params: any;

  routeTypes = ROUTE_TYPES;
  orientations = ORIENTATIONS;
  activatedRouteTypes: Array<string> = [];
  activatedAreas: Array<string> = [];
  activatedOrientations: Array<string> = [];
  constructor(
    private router: Router,
    private readonly fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private countriesTocGQL: CountriesTocGQL
  ) {
    this.cragForm = this.fb.group({
      sport: new FormControl(true, {
        validators: [],
        nonNullable: true,
      }),
      boulder: new FormControl(false, {
        validators: [],
        nonNullable: true,
      }),
      multipitch: new FormControl(false, {
        validators: [],
        nonNullable: true,
      }),
      minGrade: new FormControl(null, { validators: [] }),
      maxGrade: new FormControl(null, { validators: [] }),
    });

    this.orientations.forEach((orientation) => {
      this.cragForm.addControl(orientation.value, new FormControl(false));
    });
  }

  get selectedRouteTypes(): Array<string> {
    return this.routeTypes
      .filter((routeType) => this.cragForm.controls[routeType.id].value)
      .map((routeType) => routeType.slug);
  }

  get selectedOrientations(): Array<string> {
    return this.orientations
      .filter((orientation) => this.cragForm.controls[orientation.value].value)
      .map((orientation) => orientation.value);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.cragForm.controls['areas']) {
      this.cragForm.controls['areas'] = new FormGroup({});
    }

    if (
      changes['country'].previousValue &&
      changes['country'].currentValue.code !==
        changes['country'].previousValue.code
    ) {
      this.activatedAreas = [];
    }
    if (this.activatedRoute.snapshot.paramMap.get('obmocje')) {
      this.activatedAreas = JSON.parse(
        this.activatedRoute.snapshot.paramMap.get('obmocje')
      );
    } else {
      this.activatedAreas = [];
    }

    if (this.activatedRoute.snapshot.paramMap.get('tip')) {
      this.activatedRouteTypes = JSON.parse(
        this.activatedRoute.snapshot.paramMap.get('tip')
      );
    } else {
      this.activatedRouteTypes = [];
    }

    if (this.activatedRoute.snapshot.paramMap.get('orientacija')) {
      this.activatedOrientations = JSON.parse(
        this.activatedRoute.snapshot.paramMap.get('orientacija')
      );
    } else {
      this.activatedOrientations = [];
    }

    if (this.activatedRoute.snapshot.paramMap.get('minGrade')) {
      this.activatedMinGrade =
        this.activatedRoute.snapshot.paramMap.get('minGrade');
    } else {
      this.activatedMinGrade = null;
    }

    if (this.activatedRoute.snapshot.paramMap.get('maxGrade')) {
      this.activatedMaxGrade =
        this.activatedRoute.snapshot.paramMap.get('maxGrade');
    } else {
      this.activatedMaxGrade = null;
    }

    this.routeTypes.forEach((routeType) => {
      this.cragForm.controls[routeType.id].setValue(
        this.activatedRouteTypes.includes(routeType.slug)
      );
    });

    this.orientations.forEach((orientation) => {
      this.cragForm.controls[orientation.value].setValue(
        this.activatedOrientations.includes(orientation.value)
      );
    });

    this.currentCountrySlug = this.country.slug;
    this.initAreas(this.activatedAreas);
  }

  ngOnInit(): void {
    this.countriesTocGQL
      .watch()
      .valueChanges.subscribe(
        (result) => (this.countries = result.data.countries)
      );

    this.cragForm.controls['minGrade'].valueChanges.subscribe((value) => {
      if (value) {
        this.router.navigate(
          this.makeRoute(this.country.slug, {
            tip: JSON.stringify(this.selectedRouteTypes),
            obmocje: JSON.stringify(this.activatedAreas),
            orientacija: JSON.stringify(this.selectedOrientations),
            minGrade: value,
            maxGrade: this.cragForm.controls['maxGrade'].value,
          })
        );
      }
    });

    this.cragForm.controls['maxGrade'].valueChanges.subscribe((value) => {
      if (value) {
        this.router.navigate(
          this.makeRoute(this.country.slug, {
            tip: JSON.stringify(this.selectedRouteTypes),
            obmocje: JSON.stringify(this.activatedAreas),
            orientacija: JSON.stringify(this.selectedOrientations),
            minGrade: this.cragForm.controls['minGrade'].value,
            maxGrade: value,
          })
        );
      }
    });
  }

  closeFilters() {
    this.close.emit();
  }

  changeArea(slug: string) {
    if (this.activatedAreas.includes(slug)) {
      this.activatedAreas = this.activatedAreas.filter((area) => area !== slug);
    } else {
      this.activatedAreas.push(slug);
    }
    this.router.navigate(
      this.makeRoute(this.country.slug, {
        tip: JSON.stringify(this.selectedRouteTypes),
        obmocje: JSON.stringify(this.activatedAreas),
        orientacija: JSON.stringify(this.selectedOrientations),
      })
    );
  }

  async changeType(_slug: string) {
    await this.router.navigate(
      this.makeRoute(this.country.slug, {
        tip: JSON.stringify(this.selectedRouteTypes),
        obmocje: JSON.stringify(this.activatedAreas),
        orientacija: JSON.stringify(this.selectedOrientations),
      }),
      { relativeTo: this.activatedRoute, onSameUrlNavigation: 'ignore' }
    );
  }

  async changeOrientation(_slug: string) {
    await this.router.navigate(
      this.makeRoute(this.country.slug, {
        tip: JSON.stringify(this.selectedRouteTypes),
        obmocje: JSON.stringify(this.activatedAreas),
        orientacija: JSON.stringify(this.selectedOrientations),
      }),
      { relativeTo: this.activatedRoute, onSameUrlNavigation: 'ignore' }
    );
  }

  makeRoute(country: string, params: any = {}) {
    return ['/plezalisca', country, this.routeParams(params)];
  }

  changeCountry(slug: string) {
    this.activatedAreas = [];
    const areasFormControl = this.cragForm.controls['areas'] as FormGroup;
    Object.entries(areasFormControl.controls).forEach(([_key, control]) => {
      const myControl = control as FormControl;
      myControl.setValue(false);
    });
    this.router.navigate(
      this.makeRoute(slug, {
        tip: JSON.stringify(this.selectedRouteTypes),
        obmocje: null,
      })
    );
  }

  routeParams(params: any): any {
    params = { ...this.params, ...params };

    Object.keys(params).forEach((key) => {
      if (params[key] == null) {
        delete params[key];
      }
    });

    return params;
  }

  private initAreas(areas: Array<string>) {
    this.cragForm.controls['areas'] = new FormGroup({});
    const areasFormControl = this.cragForm.controls['areas'] as FormGroup;
    this.country.areas.forEach((area) => {
      areasFormControl.addControl(
        area.slug,
        new FormControl(areas.includes(area.slug), {
          nonNullable: true,
        })
      );
    });
  }

  protected removeAllFilters() {
    this.router.navigate(['/plezalisca']);
  }
}
