import { DatePipe } from '@angular/common';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatDivider, MatDividerModule } from '@angular/material/divider';
import { BreakpointService } from 'src/app/services/breakpoint.service';
import { AscentTypeComponent } from 'src/app/shared/components/ascent-type/ascent-type.component';
import { IconsModule } from 'src/app/shared/icons/icons.module';
import { SideEffect } from 'src/generated/graphql';

@Component({
  selector: 'app-dry-run-activity-dialog',
  templateUrl: './dry-run-activity-dialog.component.html',
  styleUrls: ['./dry-run-activity-dialog.component.scss'],
  imports: [
    MatDialogModule,
    AscentTypeComponent,
    MatButtonModule,
    DatePipe,
    IconsModule,
    MatDividerModule,
  ],
})
export class DryRunActivityDialogComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { dryRunSideEffects: SideEffect[] },
    protected readonly breakpointService: BreakpointService
  ) {}

  ngOnInit(): void {}
}
