import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Apollo, gql } from 'apollo-angular';
import { take } from 'rxjs';
import { Registry } from 'src/app/types/registry';
import {
  Country,
  Crag,
  CreateActivityMutation,
  ManagementCragFormGetCountriesGQL,
  ManagementCragFormGetCountriesQuery,
  ManagementCreateCragGQL,
  ManagementCreateCragMutation,
  ManagementUpdateCragGQL,
} from 'src/generated/graphql';

@Component({
  selector: 'app-crag-form',
  templateUrl: './crag-form.component.html',
  styleUrls: ['./crag-form.component.scss'],
})
export class CragFormComponent implements OnInit {
  @Input() crag: Crag;

  cragForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    slug: new FormControl('', [Validators.required]),
    lat: new FormControl(),
    lon: new FormControl(),
    orientation: new FormControl(),
    access: new FormControl(),
    description: new FormControl(),
    areaId: new FormControl(),
    countryId: new FormControl(null, Validators.required),
    status: new FormControl(null, Validators.required),
  });

  loading: boolean = false;

  countries: ManagementCragFormGetCountriesQuery['countries'] = [];
  areas: ManagementCragFormGetCountriesQuery['countries'][0]['areas'] = [];

  statuses: Registry[] = [
    {
      value: 'user',
      label: 'Začasno / zasebno',
    },
    {
      value: 'proposal',
      label: 'Predlagaj administratorju',
    },
    {
      value: 'admin',
      label: 'Vidno administratorjem',
    },
    {
      value: 'archive',
      label: 'Arhivirano',
    },
    {
      value: 'hidden',
      label: 'Vidno prijavljenim',
    },
    {
      value: 'public',
      label: 'Vidno vsem',
    },
  ];

  orientations: Registry[] = [
    {
      value: 'N',
      label: 'Sever',
    },
    {
      value: 'NE',
      label: 'Severovzhod',
    },
    {
      value: 'E',
      label: 'Vzhod',
    },
    {
      value: 'SE',
      label: 'Jugovzhod',
    },
    {
      value: 'S',
      label: 'Jug',
    },
    {
      value: 'SW',
      label: 'Jugozahod',
    },
    {
      value: 'W',
      label: 'Zahod',
    },
    {
      value: 'NW',
      label: 'Severozahod',
    },
  ];

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private countriesGQL: ManagementCragFormGetCountriesGQL,
    private updateCragGQL: ManagementUpdateCragGQL,
    private createCragGQL: ManagementCreateCragGQL
  ) {}

  ngOnInit(): void {
    if (this.crag != null) {
      this.cragForm.patchValue({
        ...this.crag,
        countryId: this.crag.country?.id,
        areaId: this.crag.area?.id,
      });
    }

    this.activatedRoute.params.subscribe((params) => {
      if (params.country != null) {
        this.cragForm.patchValue({
          countryId: params.country,
        });
      }
    });

    this.countriesGQL
      .fetch()
      .pipe(take(1))
      .subscribe((result) => {
        this.countries = result.data.countries;
        this.countryChanged(this.cragForm.value.countryId);
      });

    this.cragForm.controls.countryId.valueChanges.subscribe((v) => {
      this.countryChanged(v);
    });
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

  save(): void {
    this.loading = true;

    let operation = 'createCragGQL';
    let value = { ...this.cragForm.value };

    if (this.crag != null) {
      operation = 'updateCragGQL';
      value = { ...value, id: this.crag.id };
    }

    this.cragForm.disable();

    this[operation].mutate({ input: value }).subscribe(
      (result) => {
        this.snackBar.open('Podatki o plezališču so shranjeni', null, {
          duration: 3000,
        });

        if (operation == 'createCragGQL') {
          console.log(result);
          this.router.navigate([
            '/admin/uredi-plezalisce',
            result.data.createCrag.id,
          ]);
        }

        this.cragForm.enable();
        this.cragForm.markAsPristine();
        this.loading = false;
      },
      (error) => {
        this.loading = false;
        this.cragForm.enable();
        this.snackBar.open(
          'Podatkov o plezališču ni bilo mogoče shraniti',
          null,
          { panelClass: 'error', duration: 3000 }
        );
      }
    );
  }
}
