import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IceFallsRoutingModule } from './ice-falls-routing.module';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FlexLayoutModule } from 'ng-flex-layout';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [],
  imports: [
    MatSelectModule,
    MatIconModule,
    MatFormFieldModule,
    MatButtonModule,
    FlexLayoutModule,
    CommonModule,
    IceFallsRoutingModule,
  ],
})
export class IceFallsModule {}
