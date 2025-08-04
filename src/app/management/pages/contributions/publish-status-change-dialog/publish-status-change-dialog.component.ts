import { Component, Inject, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
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
    imports: [
        MatDialogActions,
        MatDialogContent,
        MatDialogModule,
        ReactiveFormsModule,
    ]
})
export class PublishStatusChangeDialogComponent implements OnInit {
  publishForm = new FormGroup({
    rejectionMessage: new FormControl('', [Validators.required]),
    cascade: new FormControl(this.data.forceCascade ?? false, []),
  });

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      cascadeMessage: string;
      newStatus: string;
      forceCascade: boolean;
    }
  ) {}

  ngOnInit(): void {}
}
