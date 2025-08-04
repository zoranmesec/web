import { Component, Inject, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogModule,
} from '@angular/material/dialog';

@Component({
  selector: 'app-publish-status-change-dialog',
  templateUrl: './publish-status-change-dialog.component.html',
  styleUrls: ['./publish-status-change-dialog.component.scss'],
  imports: [MatDialogActions, MatDialogContent, MatDialogModule],
  standalone: true,
})
export class PublishStatusChangeDialogComponent implements OnInit {
  rejectionMessage: string;
  cascade = false;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      cascadeMessage: string;
      newStatus: string;
      forceCascade: boolean;
    }
  ) {
    this.cascade = this.data.forceCascade;
  }

  ngOnInit(): void {}
}
