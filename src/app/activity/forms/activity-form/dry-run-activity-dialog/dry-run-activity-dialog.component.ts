import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { SideEffect } from 'src/generated/graphql';

@Component({
  selector: 'app-dry-run-activity-dialog',
  templateUrl: './dry-run-activity-dialog.component.html',
  styleUrls: ['./dry-run-activity-dialog.component.scss'],
  standalone: true,
  imports: [MatDialogModule],
})
export class DryRunActivityDialogComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { dryRunSideEffects: SideEffect[] }
  ) {}

  ngOnInit(): void {}
}
