import { Component, input, Input, OnInit } from '@angular/core';
import { Registry } from 'src/app/types/registry';
import { ASCENT_TYPES } from '../../../common/activity.constants';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from 'ng-flex-layout';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-star-rating',
  templateUrl: './star-rating.component.html',
  styleUrls: ['./star-rating.component.scss'],
  imports: [CommonModule, MatIconModule],
  standalone: true,
})
export class StarRatingComponent implements OnInit {
  value = input.required<number>();
  showLabel = input<boolean>(false);

  ngOnInit(): void {}
}
