import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { DragDropModule } from '@angular/cdk/drag-drop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FlexLayoutModule } from 'ng-flex-layout';
import { NgxMaskModule } from 'ngx-mask';
import { ManagementRoutingModule } from './management-routing.module';

@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        FlexLayoutModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatTabsModule,
        MatTooltipModule,
        MatSnackBarModule,
        MatAutocompleteModule,
        MatRadioModule,
        MatProgressSpinnerModule,
        MatCheckboxModule,
        MatDialogModule,
        NgxMaskModule.forRoot(),
        DragDropModule,
        ReactiveFormsModule,
        FormsModule,
        ManagementRoutingModule,
        MatCardModule
    ]
})
export class ManagementModule {}
