import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FlexLayoutModule } from 'ng-flex-layout';
import { AscentsHistoryComponent } from './pages/ascents-history/ascents-history.component';
import { CommentsHistoryComponent } from './pages/comments-history/comments-history.component';
import { StatisticsHomeComponent } from './pages/statistics-home/statistics-home.component';
import { StatisticsRoutingModule } from './statistics-routing.module';

@NgModule({
    declarations: [StatisticsHomeComponent, AscentsHistoryComponent, CommentsHistoryComponent],
    imports: [
        CommonModule,
        FlexLayoutModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        MatPaginatorModule,
        StatisticsRoutingModule
    ]
})
export class StatisticsModule {}
