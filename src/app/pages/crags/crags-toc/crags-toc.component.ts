import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatOptionModule } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { ROUTE_TYPES } from 'src/app/common/route-types.constants';
import { CountriesTocGQL, CountriesTocQuery, Country, Season, WallAngle } from '../../../../generated/graphql';

import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { FlexLayoutModule } from 'ng-flex-layout';
import { Subscription } from 'rxjs';
import { ORIENTATIONS } from 'src/app/common/orientation.constants';
import { SeasonData, WallAngleData } from 'src/app/management/forms/crag-form/crag-form.component';
import { GradeSelectComponent } from 'src/app/shared/components/grade-select/grade-select.component';
import { IconsModule } from 'src/app/shared/icons/icons.module';
import { Season as FormattedSeason } from 'src/app/types/season';
import { WallAngle as FormattedWallAngle } from 'src/app/types/wall-angle';
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
        IconsModule,
        MatDividerModule,
        MatSliderModule
    ]
})
export class CragsTocComponent implements OnInit, OnDestroy, OnChanges {
    @Input() country: Country;
    @Output() closePanel = new EventEmitter<void>();
    countries: CountriesTocQuery['countries'];

    showAllCountries = false;
    currentCountrySlug: string | undefined = undefined;
    subscriptions: Subscription[] = [];

    ngOnDestroy(): void {
        Object.entries(this.cragForm.controls).forEach(([_key, control]) => {
            control.reset();
        });
        this.subscriptions.forEach((sub) => sub.unsubscribe());
    }
    cragForm!: FormGroup;

    routeTypes = ROUTE_TYPES;
    orientations = ORIENTATIONS;
    seasons: SeasonData[] = [
        { season: Season.Spring, formattedSeason: FormattedSeason.spring },
        { season: Season.Summer, formattedSeason: FormattedSeason.summer },
        { season: Season.Autumn, formattedSeason: FormattedSeason.autumn },
        { season: Season.Winter, formattedSeason: FormattedSeason.winter }
    ];
    wallAngles: WallAngleData[] = [
        { wallAngle: WallAngle.Slab, formattedWallAngle: FormattedWallAngle.slab },
        {
            wallAngle: WallAngle.Vertical,
            formattedWallAngle: FormattedWallAngle.vertical
        },
        {
            wallAngle: WallAngle.Overhang,
            formattedWallAngle: FormattedWallAngle.overhang
        },
        { wallAngle: WallAngle.Roof, formattedWallAngle: FormattedWallAngle.roof }
    ];

    activatedRouteTypes: string[] = [];
    activatedAreas: string[] = [];
    activatedOrientations: string[] = [];
    activatedWallAngles: string[] = [];
    activatedSeasons: string[] = [];
    activatedRainProof: boolean | null = null;
    activatedAllowEmpty: boolean | null = null;
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
            maxGrade: new FormControl(null, { validators: [] }),
            rainproof: new FormControl(false),
            minApproachTime: fb.control(null),
            maxApproachTime: fb.control(null),
            allowEmpty: fb.control(false)
        });

        this.orientations.forEach((orientation) => {
            this.cragForm.addControl(orientation.value, new FormControl(false));
        });

        this.seasons.forEach((season) => {
            this.cragForm.addControl(season.season, new FormControl(false));
        });

        this.wallAngles.forEach((wallAngle) => {
            this.cragForm.addControl(wallAngle.wallAngle, new FormControl(false));
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

    get selectedSeasons(): string[] {
        return this.seasons.filter((season) => this.cragForm.controls[season.season].value).map((season) => season.season);
    }

    get selectedWallAngles(): string[] {
        return this.wallAngles
            .filter((wallAngle) => this.cragForm.controls[wallAngle.wallAngle].value)
            .map((wallAngle) => wallAngle.wallAngle);
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

        if (this.activatedRoute.snapshot.paramMap.get('sezona')) {
            this.activatedSeasons = JSON.parse(this.activatedRoute.snapshot.paramMap.get('sezona'));
        } else {
            this.activatedSeasons = [];
        }

        if (this.activatedRoute.snapshot.paramMap.get('orientacija')) {
            this.activatedOrientations = JSON.parse(this.activatedRoute.snapshot.paramMap.get('orientacija'));
        } else {
            this.activatedOrientations = [];
        }

        if (this.activatedRoute.snapshot.paramMap.get('naklon')) {
            this.activatedWallAngles = JSON.parse(this.activatedRoute.snapshot.paramMap.get('naklon'));
        } else {
            this.activatedWallAngles = [];
        }

        if (this.activatedRoute.snapshot.paramMap.get('dez')) {
            this.activatedRainProof = JSON.parse(this.activatedRoute.snapshot.paramMap.get('dez'));
            this.cragForm.controls['rainproof'].setValue(this.activatedRainProof);
        } else {
            this.activatedRainProof = null;
            this.cragForm.controls['rainproof'].setValue(false);
        }

        if (this.activatedRoute.snapshot.paramMap.get('brezPodatkov')) {
            this.activatedAllowEmpty = JSON.parse(this.activatedRoute.snapshot.paramMap.get('brezPodatkov'));
            this.cragForm.controls['allowEmpty'].setValue(this.activatedAllowEmpty);
        } else {
            this.activatedAllowEmpty = null;
            this.cragForm.controls['allowEmpty'].setValue(false);
        }

        if (this.activatedRoute.snapshot.paramMap.get('minGrade')) {
            this.cragForm.controls['minGrade'].setValue(Number(this.activatedRoute.snapshot.paramMap.get('minGrade')));
        } else {
            this.cragForm.controls['minGrade'].setValue(null);
        }

        if (this.activatedRoute.snapshot.paramMap.get('maxGrade')) {
            this.cragForm.controls['maxGrade'].setValue(Number(this.activatedRoute.snapshot.paramMap.get('maxGrade')));
        } else {
            this.cragForm.controls['maxGrade'].setValue(null);
        }

        if (this.activatedRoute.snapshot.paramMap.get('minPristopniCas')) {
            this.cragForm.controls['minApproachTime'].setValue(Number(this.activatedRoute.snapshot.paramMap.get('minPristopniCas')));
        } else {
            this.cragForm.controls['minApproachTime'].setValue(null);
        }

        if (this.activatedRoute.snapshot.paramMap.get('maxPristopniCas')) {
            this.cragForm.controls['maxApproachTime'].setValue(Number(this.activatedRoute.snapshot.paramMap.get('maxPristopniCas')));
        } else {
            this.cragForm.controls['maxApproachTime'].setValue(null);
        }

        this.routeTypes.forEach((routeType) => {
            this.cragForm.controls[routeType.id].setValue(this.activatedRouteTypes.includes(routeType.slug));
        });

        this.orientations.forEach((orientation) => {
            this.cragForm.controls[orientation.value].setValue(this.activatedOrientations.includes(orientation.value));
        });

        this.wallAngles.forEach((wallAngle) => {
            this.cragForm.controls[wallAngle.wallAngle].setValue(this.activatedWallAngles.includes(wallAngle.wallAngle));
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
                this.router.navigate(this.makeRoute(this.country.slug, this.makeFilterParams()));
            }
        });

        this.cragForm.controls['maxGrade'].valueChanges.subscribe((value) => {
            if (value) {
                this.router.navigate(this.makeRoute(this.country.slug, this.makeFilterParams()));
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
        this.router.navigate(this.makeRoute(this.country.slug, this.makeFilterParams()));
    }

    async changeType(_slug: string) {
        await this.router.navigate(this.makeRoute(this.country.slug, this.makeFilterParams()), {
            relativeTo: this.activatedRoute,
            onSameUrlNavigation: 'ignore'
        });
    }

    async changeOrientation(_slug: string) {
        await this.router.navigate(this.makeRoute(this.country.slug, this.makeFilterParams()), {
            relativeTo: this.activatedRoute,
            onSameUrlNavigation: 'ignore'
        });
    }

    async changeSeason(_slug: string) {
        await this.router.navigate(this.makeRoute(this.country.slug, this.makeFilterParams()), {
            relativeTo: this.activatedRoute,
            onSameUrlNavigation: 'ignore'
        });
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

    changeRainProof() {
        this.router.navigate(this.makeRoute(this.country.slug, this.makeFilterParams()));
    }

    changeWallAngle(_slug: string) {
        this.router.navigate(this.makeRoute(this.country.slug, this.makeFilterParams()), {
            relativeTo: this.activatedRoute,
            onSameUrlNavigation: 'ignore'
        });
    }

    changeAllowEmpty() {
        this.router.navigate(this.makeRoute(this.country.slug, this.makeFilterParams()));
    }

    approachTimeChanged() {
        this.router.navigate(this.makeRoute(this.country.slug, this.makeFilterParams()));
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

    private makeFilterParams(): Record<string, string> {
        const values = {
            obmocje: JSON.stringify(this.activatedAreas),
            tip: JSON.stringify(this.selectedRouteTypes),
            orientacija: JSON.stringify(this.selectedOrientations),
            sezona: JSON.stringify(this.selectedSeasons),
            dez: this.cragForm.controls['rainproof'].value ? '1' : '0',
            naklon: JSON.stringify(this.selectedWallAngles),
            minGrade: this.cragForm.controls['minGrade'].value,
            maxGrade: this.cragForm.controls['maxGrade'].value,
            minPristopniCas: this.cragForm.controls['minApproachTime'].value,
            maxPristopniCas: this.cragForm.controls['maxApproachTime'].value,
            brezPodatkov: this.cragForm.controls['allowEmpty'].value ? '1' : '0'
        };

        // Prevents adding default values to the route
        if (this.activatedRainProof === null && !this.cragForm.controls['rainproof'].value) {
            delete values.dez;
        }

        if (this.activatedAllowEmpty === null && !this.cragForm.controls['allowEmpty'].value) {
            delete values.brezPodatkov;
        }
        return values;
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
