import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddIconComponent } from './add-icon/add-icon.component';
import { ArrowIconComponent } from './arrow-icon/arrow-icon.component';
import { ColumnsIconComponent } from './columns-icon/columns-icon.component';
import { GalleryIconComponent } from './gallery-icon/gallery-icon.component';
import { CommentIconComponent } from './comment-icon/comment-icon.component';
import { InfoIconComponent } from './info-icon/info-icon.component';
import { MoreIconComponent } from './more-icon/more-icon.component';
import { OrientationIconComponent } from './orientation-icon/orientation-icon.component';
import { QuestionIconComponent } from './question-icon/question-icon.component';
import { RoutesIconComponent } from './routes-icon/routes-icon.component';
import { AscentTypeIconComponent } from './ascent-type-icon/ascent-type.component';
import { MinusIconComponent } from './minus-icon/minus-icon.component';
import { PlusIconComponent } from './plus-icon/plus-icon.component';
import { StarFullIconComponent } from './star-full-icon/star-full-icon.component';
import { StarEmptyIconComponent } from './star-empty-icon/star-empty-icon.component';
import { AddRoundIconComponent } from './add-round-icon/add-round-icon.component';
import { ArrowUpIconComponent } from './arrow-up-icon/arrow-up-icon.component';
import { ArrowDownIconComponent } from './arrow-down-icon/arrow-down-icon.component';
import { DeleteIconComponent } from './delete-icon/delete-icon.component';
import { CalendarIconComponent } from './calendar-icon/calendar-icon.component';
import { StatisticsIconComponent } from './statistics-icon/statistics-icon.component';
import { AscentsIconComponent } from './ascents-icon/ascents-icon.component';

@NgModule({
  declarations: [
    AddIconComponent,
    ArrowIconComponent,
    ColumnsIconComponent,
    CommentIconComponent,
    GalleryIconComponent,
    InfoIconComponent,
    MoreIconComponent,
    OrientationIconComponent,
    QuestionIconComponent,
    RoutesIconComponent,
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
  ],
  imports: [CommonModule],
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
  ],
})
export class IconsModule {}
