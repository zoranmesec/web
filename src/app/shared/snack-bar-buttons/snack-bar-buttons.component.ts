import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import {
  MatSnackBarRef,
  MAT_SNACK_BAR_DATA,
} from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';

export interface SnackBarData {
  buttons: any[];
}

@Component({
  selector: 'app-snack-bar-buttons',
  templateUrl: './snack-bar-buttons.component.html',
  styleUrls: ['./snack-bar-buttons.component.scss'],
  imports: [CommonModule, MatButtonModule, MatIconModule],
})
export class SnackBarButtonsComponent implements OnInit {
  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public data: SnackBarData,
    public snackBarRef: MatSnackBarRef<SnackBarButtonsComponent>
  ) {}

  ngOnInit(): void {}

  closeDialog() {
    this.snackBarRef.dismiss();
  }
}
