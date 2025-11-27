import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';

import { MatIconModule } from '@angular/material/icon';

import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSliderModule } from '@angular/material/slider';

import { MatRadioModule } from '@angular/material/radio';
import { FlexLayoutModule } from 'ng-flex-layout';
import { Subscription } from 'rxjs';
import { GradingSystemsService } from 'src/app/shared/services/grading-systems.service';
import { GradingSystemsQuery } from 'src/generated/graphql';
import { CragRoutesFiltersService } from '../crag-routes-filters.service';
@Component({
    selector: 'app-crag-routes-filters',
    templateUrl: './crag-routes-filters.component.html',
    styleUrls: ['./crag-routes-filters.component.scss'],
    imports: [MatIconModule, MatExpansionModule, FormsModule, ReactiveFormsModule, MatRadioModule, FlexLayoutModule, MatSliderModule]
})
export class CragRoutesFiltersComponent implements OnDestroy, OnInit {
    @Output() close = new EventEmitter<void>();

    subscriptions: Subscription[] = [];
    gradingSystemId = 'french';

    ngOnDestroy(): void {
        this.subscriptions.forEach((sub) => sub.unsubscribe());
    }
    filtersForm!: FormGroup;
    allGrades: GradingSystemsQuery['gradingSystems'][0]['grades'] = [];
    constructor(
        private readonly fb: FormBuilder,
        private cragRoutesFiltersService: CragRoutesFiltersService,
        private gradingSystemService: GradingSystemsService
    ) {
        this.filtersForm = this.fb.group({
            myAscents: fb.control('all'),
            starRating: fb.group({
                0: fb.control(false),
                1: fb.control(false),
                2: fb.control(false)
            }),
            minDifficulty: fb.control(100),
            maxDifficulty: fb.control(2100)
        });

        void this.fetchGrades();

        this.filtersForm.controls['minDifficulty'].valueChanges.subscribe((value) => {
            cragRoutesFiltersService.setMinGrade(value);
        });

        this.filtersForm.controls['maxDifficulty'].valueChanges.subscribe((value) => {
            cragRoutesFiltersService.setMaxGrade(value);
        });

        this.filtersForm.controls['starRating'].valueChanges.subscribe((value) => {
            cragRoutesFiltersService.setStarRating(Object.values(value) as boolean[]);
        });

        this.subscriptions.push(
            this.filtersForm.controls['myAscents'].valueChanges.subscribe((value) => {
                cragRoutesFiltersService.setMyAscents(value);
            })
        );
    }

    ngOnInit(): void {
        this.filtersForm.patchValue({
            myAscents: this.cragRoutesFiltersService.myAscents(),
            starRating: this.cragRoutesFiltersService.starRating(),
            minDifficulty: this.cragRoutesFiltersService.minGrade(),
            maxDifficulty: this.cragRoutesFiltersService.maxGrade()
        });
    }

    async fetchGrades(): Promise<void> {
        const gradingSystems = await this.gradingSystemService.getGradingSystems();
        const myGradingSystem = gradingSystems.find((gs) => gs.id === this.gradingSystemId);
        if (myGradingSystem !== null) {
            this.allGrades = myGradingSystem.grades;
        }
    }

    formatLabel(value: number): string {
        let myValue = value;
        if (value === 350 || value === 250 || value === 150) myValue = value - 50;
        const grade = this.allGrades.find((grade) => grade.difficulty === myValue);

        if (grade !== null) return grade.name;

        return `${value}`;
    }

    closeFilters() {
        this.close.emit();
    }

    protected removeAllFilters() {
        this.cragRoutesFiltersService.resetAllFilters();

        this.filtersForm.reset({
            myAscents: 'all',
            starRating: {
                0: false,
                1: false,
                2: false
            },
            minDifficulty: CragRoutesFiltersService.MIN_GRADE,
            maxDifficulty: CragRoutesFiltersService.MAX_GRADE
        });
    }
}
