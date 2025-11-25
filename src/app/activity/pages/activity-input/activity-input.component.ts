import { Component, Inject, OnInit } from '@angular/core';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { Activity, Crag, IceFall, Peak, Route } from 'src/generated/graphql';
import ActivitySelection from 'src/app/types/activity-selection.interface';

import { ActivityFormComponent } from '../../forms/activity-form/activity-form.component';

import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { DialogData } from 'src/app/shared/components/comment-form/comment-form.component';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-activity-input',
  templateUrl: './activity-input.component.html',
  styleUrls: ['./activity-input.component.scss'],
  imports: [ActivityFormComponent, MatDialogModule, MatButtonModule],
})
export class ActivityInputComponent implements OnInit {
  type: string = null;
  routes: Route[] = [];
  crag: Crag;
  peak: Peak;
  iceFall: IceFall;
  protected activity: Activity;

  constructor(
    private localStorageService: LocalStorageService,
    public dialogRef: MatDialogRef<ActivityInputComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  ngOnInit(): void {
    if (this.data.crag != null) {
      this.initCrag(this.data.crag.id);
    }
    this.activity = this.data.activity;
    this.iceFall = this.data.iceFall;
    this.peak = this.data.peak;
    this.crag = this.data.crag;
  }

  protected closeDialog(): void {
    this.dialogRef.close();
  }

  initCrag(cragId: string): void {
    const activitySelection: ActivitySelection =
      this.localStorageService.getItem('activity-selection');

    if (activitySelection && activitySelection.crag.id == cragId) {
      const { routes, crag } = activitySelection;
      this.routes = routes;
      this.crag = crag;
      this.type = 'crag';
    }
  }
}
