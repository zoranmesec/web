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
import { AscentTypeIconComponent } from './icons/ascent-type.component';

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
  ],
  imports: [CommonModule],
  exports: [AddIconComponent, ArrowIconComponent, AscentTypeIconComponent],
})
export class IconsModule {}
