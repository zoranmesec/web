import { Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { FlexLayoutModule } from 'ng-flex-layout';
import { Subscription } from 'rxjs';
import { IconsModule } from 'src/app/shared/icons/icons.module';
import { ColumnType } from '../crag-routes.component';

export const allColumns: Record<string, ColumnType> = {
    name: {
        field: 'name',
        selectLabel: 'Ime',
        tableLabel: 'Ime',
        defaultSortDirection: 1,
        width: 100
    },
    length: {
        field: 'length',
        selectLabel: 'Dolžina',
        tableLabel: 'Dolžina',
        defaultSortDirection: 1,
        width: 85
    },
    difficulty: {
        field: 'difficulty',
        selectLabel: 'Težavnost',
        tableLabel: 'Težavnost',
        defaultSortDirection: 1,
        width: 103
    },
    nrTicks: {
        field: 'nrTicks',
        selectLabel: 'Število uspešnih vzponov',
        tableLabel: 'Št. uspešnih vzponov',
        defaultSortDirection: -1,
        width: 200
    },
    nrTries: {
        field: 'nrTries',
        selectLabel: 'Število poskusov',
        tableLabel: 'Št. poskusov',
        defaultSortDirection: -1,
        width: 150
    },
    nrClimbers: {
        field: 'nrClimbers',
        selectLabel: 'Število plezalcev',
        tableLabel: 'Št. plezalcev',
        defaultSortDirection: -1,
        width: 150
    },
    starRating: {
        field: 'starRating',
        selectLabel: 'Lepota smeri',
        defaultSortDirection: -1,
        width: 36
    },
    multipitch: {
        field: 'multipitch',
        selectLabel: 'Večraztežajna smer',
        defaultSortDirection: -1,
        width: 36
    },
    comments: {
        field: 'comments',
        selectLabel: 'Smer ima komentarje',
        defaultSortDirection: -1,
        width: 36
    },
    myAscents: {
        field: 'myAscents',
        selectLabel: 'Moji vzponi',
        defaultSortDirection: -1,
        width: 52
    }
};

@Component({
    selector: 'app-crag-routes-columns',
    templateUrl: './crag-routes-columns.component.html',
    styleUrls: ['./crag-routes-columns.component.scss'],
    imports: [
        MatIconModule,
        MatExpansionModule,
        FormsModule,
        ReactiveFormsModule,
        MatRadioModule,
        MatSelectModule,
        FlexLayoutModule,
        MatButtonModule,
        IconsModule
    ]
})
export class CragRoutesColumnsComponent implements OnDestroy {
    @Output() columns = new EventEmitter<Record<string, ColumnType>>();
    @Output() closePanel = new EventEmitter<void>();

    subscriptions: Subscription[] = [];

    columnForm!: FormGroup;
    allColumns: Record<string, ColumnType> = allColumns;

    ngOnDestroy(): void {
        this.subscriptions.forEach((sub) => sub.unsubscribe());
    }

    constructor(private readonly fb: FormBuilder) {
        const savedColumns = localStorage.getItem('cragRoutesSelectedColumns');

        this.columnForm = this.fb.group({
            name: new FormControl(savedColumns ? savedColumns.includes('name') : true),
            length: new FormControl(savedColumns ? savedColumns.includes('length') : true),
            difficulty: new FormControl(savedColumns ? savedColumns.includes('difficulty') : true),
            nrTicks: new FormControl(savedColumns ? savedColumns.includes('nrTicks') : true),
            nrTries: new FormControl(savedColumns ? savedColumns.includes('nrTries') : true),
            nrClimbers: new FormControl(savedColumns ? savedColumns.includes('nrClimbers') : true),
            starRating: new FormControl(savedColumns ? savedColumns.includes('starRating') : true),
            multipitch: new FormControl(savedColumns ? savedColumns.includes('multipitch') : true),
            comments: new FormControl(savedColumns ? savedColumns.includes('comments') : true),
            myAscents: new FormControl(savedColumns ? savedColumns.includes('myAscents') : true)
        });

        this.columns.emit(this.allColumns);
        this.subscriptions.push(
            this.columnForm.valueChanges.subscribe((value) => {
                const selectedColumns: Record<string, ColumnType> = {};
                for (const key of Object.keys(value)) {
                    if (value[key]) {
                        selectedColumns[key] = this.allColumns[key];
                    }
                }

                localStorage.setItem('cragRoutesSelectedColumns', JSON.stringify(Object.keys(selectedColumns)));
                this.columns.emit(selectedColumns);
            })
        );
    }

    get allColumnsArray() {
        return Object.values(this.allColumns);
    }

    closeFilters() {
        this.closePanel.emit();
    }

    protected resetColumns() {
        this.columnForm.controls['name'].setValue(true);
        this.columnForm.controls['length'].setValue(true);
        this.columnForm.controls['difficulty'].setValue(true);
        this.columnForm.controls['nrTicks'].setValue(true);
        this.columnForm.controls['nrTries'].setValue(true);
        this.columnForm.controls['nrClimbers'].setValue(true);
        this.columnForm.controls['starRating'].setValue(true);
        this.columnForm.controls['multipitch'].setValue(true);
        this.columnForm.controls['comments'].setValue(true);
        this.columnForm.controls['myAscents'].setValue(true);
    }
}
