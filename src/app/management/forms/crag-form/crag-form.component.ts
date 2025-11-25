import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  FormControl,
  UntypedFormGroup,
  Validators,
  FormGroup,
  FormBuilder,
} from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '@sentry/angular';
import { Apollo } from 'apollo-angular';
import { filter, Observable, Subscription, switchMap, take, tap } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { Registry } from 'src/app/types/registry';
import {
  Crag,
  CreateCragInput,
  GradingSystem,
  ManagementCragFormGetCountriesGQL,
  ManagementCragFormGetCountriesQuery,
  ManagementCreateCragGQL,
  ManagementDeleteCragGQL,
  ManagementUpdateCragGQL,
  Orientation,
  Season,
  WallAngle,
} from 'src/generated/graphql';
import { GradingSystemsService } from '../../../shared/services/grading-systems.service';
import { ContributionService } from '../../pages/contributions/contribution/contribution.service';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { ORIENTATIONS } from 'src/app/common/orientation.constants';
import { MutateResult } from '@apollo/client';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { IconsModule } from 'src/app/shared/icons/icons.module';

import { WallAngle as FormattedWallAngle } from 'src/app/types/wall-angle';
import { Season as FormattedSeason } from 'src/app/types/season';
import { WallAngleOptionComponent } from './wall-angle-option/wall-angle-option.component';
import { MatRadioModule } from '@angular/material/radio';
import { SeasonOptionComponent } from './season-option/season-option.component';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-crag-form',
  templateUrl: './crag-form.component.html',
  styleUrls: ['./crag-form.component.scss'],
  imports: [
    MatCheckbox,
    MatDialogModule,
    MatSnackBarModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    IconsModule,
    WallAngleOptionComponent,
    SeasonOptionComponent,
    MatRadioModule,
    MatButtonModule,
  ],
})
export class CragFormComponent implements OnInit, OnDestroy {
  @Input() crag: Crag;

  fb: FormBuilder = inject(FormBuilder);

  cragForm = this.fb.group({
    name: this.fb.control('', [Validators.required]),
    type: this.fb.control('sport', [Validators.required]),
    lat: this.fb.control(0),
    lon: this.fb.control(0),
    orientations: this.fb.control<Orientation[]>([]),
    access: this.fb.control(''),
    description: this.fb.control(''),
    areaId: this.fb.control(''),
    countryId: this.fb.control({ value: '', disabled: false }, [
      Validators.required,
    ]),
    isHidden: this.fb.control(false),
    defaultGradingSystemId: this.fb.control(null, Validators.required),
    publishStatus: this.fb.control('draft'),
    wallAngles: this.fb.control<WallAngle[]>([]),
    rainproof: this.fb.control(null),
    seasons: this.fb.control<Season[]>([]),
  });

  loading: boolean = false;

  countries: ManagementCragFormGetCountriesQuery['countries'] = [];
  areas: ManagementCragFormGetCountriesQuery['countries'][0]['areas'] = [];

  gradingSystems: GradingSystem[];
  subscriptions: Subscription[] = [];

  user: User;

  types: Registry[] = [
    {
      value: 'sport',
      label: 'Športno / balvani / dolge športne',
    },
    {
      value: 'alpine',
      label: 'Alpinizem',
    },
  ];

  orientations: Registry[] = ORIENTATIONS;
  protected wallAngles: {
    wallAngle: WallAngle;
    formattedWallAngle: FormattedWallAngle;
  }[] = [
    {
      wallAngle: WallAngle.Vertical,
      formattedWallAngle: FormattedWallAngle.vertical,
    },
    { wallAngle: WallAngle.Slab, formattedWallAngle: FormattedWallAngle.slab },
    {
      wallAngle: WallAngle.Overhang,
      formattedWallAngle: FormattedWallAngle.overhang,
    },
    { wallAngle: WallAngle.Roof, formattedWallAngle: FormattedWallAngle.roof },
  ];

  protected seasons: { season: Season; formattedSeason: FormattedSeason }[] = [
    { season: Season.Spring, formattedSeason: FormattedSeason.spring },
    { season: Season.Summer, formattedSeason: FormattedSeason.summer },
    { season: Season.Autumn, formattedSeason: FormattedSeason.autumn },
    { season: Season.Winter, formattedSeason: FormattedSeason.winter },
  ];

  constructor(
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private gradingSystemsService: GradingSystemsService,
    private countriesGQL: ManagementCragFormGetCountriesGQL,
    private updateCragGQL: ManagementUpdateCragGQL,
    private createCragGQL: ManagementCreateCragGQL,
    private deleteCragGQL: ManagementDeleteCragGQL,
    private apollo: Apollo,
    public contributionService: ContributionService
  ) {}

  ngOnInit(): void {
    this.cragForm.disable();

    const userSub = this.authService.currentUser.subscribe((user) => {
      this.user = user;

      if (
        this.user.roles.includes('admin') ||
        !this.crag ||
        this.crag.publishStatus === 'draft'
      ) {
        this.cragForm.enable();
      }
    });
    this.subscriptions.push(userSub);

    const cragPublishStatusSub =
      this.contributionService.publishStatusChanged$.subscribe(
        (newPublishStatus: string) => {
          // We have 2 special cases here:
          //  1) An editor rejected a crag which he now cannot access anymore -> should redirect to Contributions page
          if (
            this.user.roles.includes('admin') &&
            newPublishStatus === 'draft'
          ) {
            this.router.navigate(['/urejanje/prispevki']);
          }

          //  2) A normal user pushed the crag into review -> should disable the form for editing
          if (
            !this.user.roles.includes('admin') &&
            newPublishStatus === 'in_review'
          ) {
            this.cragForm.disable();
          }
        }
      );
    this.subscriptions.push(cragPublishStatusSub);

    if (this.crag != null) {
      this.cragForm.patchValue({
        ...this.crag,
        countryId: this.crag.country?.id,
        areaId: this.crag.area?.id,
        defaultGradingSystemId: this.crag.defaultGradingSystem?.id,
        wallAngles: [],
      });
    }

    this.gradingSystemsService.getGradingSystems().then((gradingSystems) => {
      this.gradingSystems = <GradingSystem[]>gradingSystems;
    });

    const routeSub = this.activatedRoute.params.subscribe((params) => {
      if (params.country != null) {
        this.cragForm.patchValue({
          countryId: params.country,
        });
      }
    });
    this.subscriptions.push(routeSub);

    this.countriesGQL
      .fetch({
        variables: { input: { orderBy: { field: 'name', direction: 'ASC' } } },
      })
      .pipe(take(1))
      .subscribe((result) => {
        this.countries = result.data.countries;
        this.countryChanged(this.cragForm.value.countryId);
      });

    const countrySub = this.cragForm.controls.countryId.valueChanges.subscribe(
      (v) => {
        this.countryChanged(v);
      }
    );
    this.subscriptions.push(countrySub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  countryChanged(value: string) {
    const c = this.countries.find((country) => country.id == value);

    if (c != null) {
      this.areas = c != null ? c.areas : [];
    }

    if (!this.areas.find((a) => a.id == this.cragForm.value.areaId)) {
      this.cragForm.patchValue({ areaId: null });
    }
  }

  formatCoordinate(event: { target: { value: string } }, controlName: string) {
    this.cragForm.patchValue({
      [controlName]: event.target.value
        ? Math.round(parseFloat(event.target.value) * 100000) / 100000
        : null,
    });
  }

  save(): void {
    this.loading = true;

    let mutation: Observable<MutateResult>;
    debugger;
    if (this.crag != null) {
      const value = { ...this.cragForm.value, id: this.crag.id };
      this.cragForm.disable();
      mutation = this.updateCragGQL.mutate({ variables: { input: value } });
    } else {
      const value = { ...this.cragForm.value } as CreateCragInput;
      this.cragForm.disable();
      mutation = this.createCragGQL.mutate({ variables: { input: value } });
    }

    mutation.pipe(take(1)).subscribe({
      next: (result: any) => {
        this.snackBar.open('Podatki o plezališču so shranjeni', null, {
          duration: 3000,
        });

        this.apollo.client.resetStore().then(() => {
          if (this.crag == null && result.data?.createCrag?.id) {
            this.router.navigate([
              '/urejanje/uredi-plezalisce',
              result.data.createCrag.id,
            ]);
          }

          this.cragForm.enable();
          this.cragForm.markAsPristine();
          this.loading = false;
        });
      },
      error: () => {
        this.loading = false;
        this.cragForm.enable();
        this.snackBar.open(
          'Podatkov o plezališču ni bilo mogoče shraniti',
          null,
          { panelClass: 'error', duration: 3000 }
        );
      },
    });
  }

  deleteCrag() {
    this.dialog
      .open(ConfirmationDialogComponent, {
        data: {
          message:
            'Si prepričan_a, da želiš izbrisati to plezališče in vse sektorje in smeri v njem?',
        },
      })
      .afterClosed()
      .pipe(
        take(1),
        filter((value) => value != null),
        tap(() => {
          this.loading = true;
        }),
        switchMap(() =>
          this.deleteCragGQL.mutate({ variables: { id: this.crag.id } })
        )
      )
      .subscribe({
        next: () => {
          this.snackBar.open('Plezališče je bilo izbrisano', null, {
            duration: 3000,
          });
          this.apollo.client.resetStore();
          this.router.navigate(['/plezalisca']);
        },
        error: (error) => {
          if (error.message === 'crag_has_log_entries') {
            error.message =
              'Plezališča ni mogoče izbrisati, ker so v njem zabeležene aktivnosti.';
          }
          this.snackBar.open(error.message, null, {
            panelClass: 'error',
            duration: 3000,
          });
          this.loading = false;
        },
      });
  }

  /**
   * A crag can be deleted if it is still a draft. An editor can also delete a crag but not one that was pushed to review.
   */
  canDelete() {
    return (
      this.crag?.publishStatus === 'draft' ||
      (this.user.roles.includes('admin') &&
        this.crag?.publishStatus === 'published')
    );
  }
}
