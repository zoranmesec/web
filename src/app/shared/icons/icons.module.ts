import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AddIconComponent } from './add-icon/add-icon.component';
import { AddRoundIconComponent } from './add-round-icon/add-round-icon.component';
import { ArrowDownIconComponent } from './arrow-down-icon/arrow-down-icon.component';
import { ArrowIconComponent } from './arrow-icon/arrow-icon.component';
import { ArrowRightIconComponent } from './arrow-right-icon/arrow-right-icon.component';
import { ArrowUpIconComponent } from './arrow-up-icon/arrow-up-icon.component';
import { AscentTypeIconComponent } from './ascent-type-icon/ascent-type.component';
import { AscentsIconComponent } from './ascents-icon/ascents-icon.component';

import { SignalPipe } from '../pipes/signal.pipe';
import { ApproachIconComponent } from './approach-icon/approach-icon.component';
import { CalendarIconComponent } from './calendar-icon/calendar-icon.component';
import { CloseIconComponent } from './close-icon/close-icon.component';
import { ColumnsIconComponent } from './columns-icon/columns-icon.component';
import { CommentIconComponent } from './comment-icon/comment-icon.component';
import { DeleteIconComponent } from './delete-icon/delete-icon.component';
import { DragIconComponent } from './drag-icon/drag-icon.component';
import { EditIconComponent } from './edit-icon/edit-icon.component';
import { GalleryIconComponent } from './gallery-icon/gallery-icon.component';
import { HeightIconComponent } from './height-icon/height-icon.component';
import { InfoIconComponent } from './info-icon/info-icon.component';
import { MergeIconComponent } from './merge-icon/merge-icon.component';
import { MinusIconComponent } from './minus-icon/minus-icon.component';
import { MoreIconComponent } from './more-icon/more-icon.component';
import { OrientationIconComponent } from './orientation-icon/orientation-icon.component';
import { PlusIconComponent } from './plus-icon/plus-icon.component';
import { QuestionIconComponent } from './question-icon/question-icon.component';
import { RainproofIconComponent } from './rainproof-icon/rainproof-icon.component';
import { RefreshIconComponent } from './refresh-icon/refresh-icon.component';
import { RoutesIconComponent } from './routes-icon/routes-icon.component';
import { SeasonIconComponent } from './season-icon/season-icon.component';
import { StarEmptyIconComponent } from './star-empty-icon/star-empty-icon.component';
import { StarFullIconComponent } from './star-full-icon/star-full-icon.component';
import { StatisticsIconComponent } from './statistics-icon/statistics-icon.component';
import { TodayIconComponent } from './today-icon/today-icon.component';
import { WallAngleIconComponent } from './wall-angle-icon/wall-angle-icon.component';

@NgModule({
    declarations: [
        AddIconComponent,
        ColumnsIconComponent,
        CommentIconComponent,
        GalleryIconComponent,
        InfoIconComponent,
        MoreIconComponent,
        OrientationIconComponent,
        QuestionIconComponent,
        RoutesIconComponent,
        MinusIconComponent,
        PlusIconComponent,
        StarFullIconComponent,
        StarEmptyIconComponent,
        AddRoundIconComponent,
        ArrowUpIconComponent,
        ArrowDownIconComponent,
        DeleteIconComponent,
        CalendarIconComponent,
        StatisticsIconComponent,
        AscentsIconComponent,
        MergeIconComponent,
        HeightIconComponent,
        CloseIconComponent,
        RefreshIconComponent,
        TodayIconComponent,
        ArrowRightIconComponent,
        SeasonIconComponent,
        ArrowIconComponent,
        WallAngleIconComponent,
        AscentTypeIconComponent,
        ApproachIconComponent,
        RainproofIconComponent,
        DragIconComponent,
        EditIconComponent
    ],
    imports: [SignalPipe, CommonModule],
    exports: [
        AddIconComponent,
        ArrowIconComponent,
        AscentTypeIconComponent,
        MinusIconComponent,
        PlusIconComponent,
        StarFullIconComponent,
        StarEmptyIconComponent,
        AddRoundIconComponent,
        ArrowUpIconComponent,
        ArrowDownIconComponent,
        DeleteIconComponent,
        CalendarIconComponent,
        StatisticsIconComponent,
        AscentsIconComponent,
        ColumnsIconComponent,
        CommentIconComponent,
        GalleryIconComponent,
        InfoIconComponent,
        RoutesIconComponent,
        MoreIconComponent,
        OrientationIconComponent,
        QuestionIconComponent,
        MergeIconComponent,
        HeightIconComponent,
        CloseIconComponent,
        RefreshIconComponent,
        TodayIconComponent,
        ArrowRightIconComponent,
        WallAngleIconComponent,
        SeasonIconComponent,
        ApproachIconComponent,
        RainproofIconComponent,
        DragIconComponent,
        EditIconComponent
    ]
})
export class IconsModule {}
