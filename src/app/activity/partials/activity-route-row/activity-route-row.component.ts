import { Component, input, Input, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { PUBLISH_OPTIONS } from 'src/app/common/activity.constants';
import {
  ActivityRoute,
  ActivityRouteChangePublishGQL,
} from 'src/generated/graphql';
import { RowAction } from '../../pages/activity-log/activity-log.component';
import { RouterLink } from '@angular/router';
import { AscentTypeComponent } from 'src/app/shared/components/ascent-type/ascent-type.component';
import { AscentPublishOptionComponent } from 'src/app/shared/components/ascent-publish-option/ascent-publish-option.component';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { GradeComponent } from 'src/app/shared/components/grade/grade.component';
import { IconsModule } from 'src/app/shared/icons/icons.module';
import { BreakpointService } from 'src/app/services/breakpoint.service';

@Component({
  selector: '[app-activity-route-row]',
  templateUrl: './activity-route-row.component.html',
  styleUrls: ['./activity-route-row.component.scss'],
  imports: [
    RouterLink,
    AscentTypeComponent,
    AscentPublishOptionComponent,
    CommonModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    GradeComponent,
    IconsModule,
  ],
})
export class ActivityRouteRowComponent {
  @Input() route: ActivityRoute;
  @Input() rowAction: Subject<RowAction>;
  @Input() displayType: 'activity' | 'activityForm' | 'routes' = 'routes';
  @Input() noNotes = false;
  @Input() noTopropeOnPage = false;

  columns = input<Record<string, boolean>>({});

  publishOptions = PUBLISH_OPTIONS;

  constructor(
    private activityRouteChangePublishGQL: ActivityRouteChangePublishGQL,
    private snackbar: MatSnackBar,
    protected readonly breakpointService: BreakpointService
  ) {}

  changePublish(value: string) {
    this.activityRouteChangePublishGQL
      .mutate({
        variables: { input: { id: this.route.id, publish: value } },
      })
      .subscribe({
        next: () => {
          this.snackbar.open('Vidnost vzpona je bila spremenjena', null, {
            duration: 2000,
          });
        },
        error: () => {
          this.snackbar.open('Vidnosti ni bilo mogoče spremeniti', null, {
            panelClass: 'error',
            duration: 3000,
          });
        },
      });
  }
}
