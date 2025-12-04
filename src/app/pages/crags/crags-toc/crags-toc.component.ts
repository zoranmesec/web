import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatOptionModule } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { ROUTE_TYPES } from 'src/app/common/route-types.constants';
import { CountriesTocGQL, CountriesTocQuery, Country } from '../../../../generated/graphql';

import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatInputModule } from '@angular/material/input';
import { FlexLayoutModule } from 'ng-flex-layout';
import { Subscription } from 'rxjs';
import { ORIENTATIONS } from 'src/app/common/orientation.constants';
import { GradeSelectComponent } from 'src/app/shared/components/grade-select/grade-select.component';
import { IconsModule } from 'src/app/shared/icons/icons.module';
@Component({
    selector: 'app-crags-toc',
    templateUrl: './crags-toc.component.html',
    styleUrls: ['./crags-toc.component.scss'],
    imports: [
        MatIcon,
        MatOptionModule,
        MatButtonModule,
        MatExpansionModule,
        MatCheckboxModule,
        FormsModule,
        ReactiveFormsModule,
        FlexLayoutModule,
        MatInputModule,
        GradeSelectComponent,
        IconsModule
    ]
})
export class CragsTocComponent implements OnInit, OnDestroy, OnChanges {
    @Input() country: Country;
    @Output() closePanel = new EventEmitter<void>();
    countries: CountriesTocQuery['countries'];

    showAllCountries = false;
    currentCountrySlug: string | undefined = undefined;
    subscriptions: Subscription[] = [];
    activatedMinGrade: string | null = null;
    activatedMaxGrade: string | null = null;

    ngOnDestroy(): void {
        Object.entries(this.cragForm.controls).forEach(([_key, control]) => {
            control.reset();
        });
        this.subscriptions.forEach((sub) => sub.unsubscribe());
    }
    cragForm!: FormGroup;

    routeTypes = ROUTE_TYPES;
    orientations = ORIENTATIONS;
    activatedRouteTypes: string[] = [];
    activatedAreas: string[] = [];
    activatedOrientations: string[] = [];
    constructor(
        private router: Router,
        private readonly fb: FormBuilder,
        private activatedRoute: ActivatedRoute,
        private countriesTocGQL: CountriesTocGQL
    ) {
        this.cragForm = this.fb.group({
            sport: new FormControl(true, {
                validators: [],
                nonNullable: true
            }),
            boulder: new FormControl(false, {
                validators: [],
                nonNullable: true
            }),
            multipitch: new FormControl(false, {
                validators: [],
                nonNullable: true
            }),
            minGrade: new FormControl(null, { validators: [] }),
            maxGrade: new FormControl(null, { validators: [] })
        });

        this.orientations.forEach((orientation) => {
            this.cragForm.addControl(orientation.value, new FormControl(false));
        });
    }

    get selectedRouteTypes(): string[] {
        return this.routeTypes.filter((routeType) => this.cragForm.controls[routeType.id].value).map((routeType) => routeType.slug);
    }

    get selectedOrientations(): string[] {
        return this.orientations
            .filter((orientation) => this.cragForm.controls[orientation.value].value)
            .map((orientation) => orientation.value);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (!this.cragForm.controls['areas']) {
            this.cragForm.controls['areas'] = new FormGroup({});
        }

        if (changes['country'].previousValue && changes['country'].currentValue.code !== changes['country'].previousValue.code) {
            this.activatedAreas = [];
        }
        if (this.activatedRoute.snapshot.paramMap.get('obmocje')) {
            this.activatedAreas = JSON.parse(this.activatedRoute.snapshot.paramMap.get('obmocje'));
        } else {
            this.activatedAreas = [];
        }

        if (this.activatedRoute.snapshot.paramMap.get('tip')) {
            this.activatedRouteTypes = JSON.parse(this.activatedRoute.snapshot.paramMap.get('tip'));
        } else {
            this.activatedRouteTypes = [];
        }

        if (this.activatedRoute.snapshot.paramMap.get('orientacija')) {
            this.activatedOrientations = JSON.parse(this.activatedRoute.snapshot.paramMap.get('orientacija'));
        } else {
            this.activatedOrientations = [];
        }

        if (this.activatedRoute.snapshot.paramMap.get('minGrade')) {
            this.activatedMinGrade = this.activatedRoute.snapshot.paramMap.get('minGrade');
        } else {
            this.activatedMinGrade = null;
        }

        if (this.activatedRoute.snapshot.paramMap.get('maxGrade')) {
            this.activatedMaxGrade = this.activatedRoute.snapshot.paramMap.get('maxGrade');
        } else {
            this.activatedMaxGrade = null;
        }

        this.routeTypes.forEach((routeType) => {
            this.cragForm.controls[routeType.id].setValue(this.activatedRouteTypes.includes(routeType.slug));
        });

        this.orientations.forEach((orientation) => {
            this.cragForm.controls[orientation.value].setValue(this.activatedOrientations.includes(orientation.value));
        });

        this.currentCountrySlug = this.country.slug;
        this.initAreas(this.activatedAreas);
    }

    ngOnInit(): void {
        this.countriesTocGQL.watch().valueChanges.subscribe((result) => {
            if (result.data) {
                this.countries = result.data.countries as CountriesTocQuery['countries'];
            }
        });

        this.cragForm.controls['minGrade'].valueChanges.subscribe((value) => {
            if (value) {
                this.router.navigate(
                    this.makeRoute(this.country.slug, {
                        tip: JSON.stringify(this.selectedRouteTypes),
                        obmocje: JSON.stringify(this.activatedAreas),
                        orientacija: JSON.stringify(this.selectedOrientations),
                        minGrade: value,
                        maxGrade: this.cragForm.controls['maxGrade'].value
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
                        maxGrade: value
                    })
                );
            }
        });
    }

    closeFilters() {
        this.closePanel.emit();
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
                orientacija: JSON.stringify(this.selectedOrientations)
            })
        );
    }

    async changeType(_slug: string) {
        await this.router.navigate(
            this.makeRoute(this.country.slug, {
                tip: JSON.stringify(this.selectedRouteTypes),
                obmocje: JSON.stringify(this.activatedAreas),
                orientacija: JSON.stringify(this.selectedOrientations)
            }),
            { relativeTo: this.activatedRoute, onSameUrlNavigation: 'ignore' }
        );
    }

    async changeOrientation(_slug: string) {
        await this.router.navigate(
            this.makeRoute(this.country.slug, {
                tip: JSON.stringify(this.selectedRouteTypes),
                obmocje: JSON.stringify(this.activatedAreas),
                orientacija: JSON.stringify(this.selectedOrientations)
            }),
            { relativeTo: this.activatedRoute, onSameUrlNavigation: 'ignore' }
        );
    }

    makeRoute(country: string, params: Record<string, string | null> = {}) {
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
                obmocje: null
            })
        );
    }

    routeParams(params: Record<string, string | null>): Record<string, string> {
        params = { ...params };

        Object.keys(params).forEach((key) => {
            if (params[key] === null) {
                delete params[key];
            }
        });

        return params;
    }

    private initAreas(areas: string[]) {
        this.cragForm.controls['areas'] = new FormGroup({});
        const areasFormControl = this.cragForm.controls['areas'] as FormGroup;
        this.country.areas.forEach((area) => {
            areasFormControl.addControl(
                area.slug,
                new FormControl(areas.includes(area.slug), {
                    nonNullable: true
                })
            );
        });
    }

    protected removeAllFilters() {
        this.router.navigate(['/plezalisca']);
    }
}
