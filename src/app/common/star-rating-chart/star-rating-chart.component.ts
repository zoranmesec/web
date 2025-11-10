import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, input, OnChanges } from '@angular/core';
import { StarRatingComponent } from 'src/app/shared/components/star-rating/star-rating.component';

export interface IStarRatingChartDistribution {
  stars: number;
  value: number;
}

@Component({
  selector: 'app-star-rating-chart',
  templateUrl: './star-rating-chart.component.html',
  styleUrls: ['./star-rating-chart.component.scss'],
  standalone: true,
  imports: [CommonModule, StarRatingComponent],
})
export class StarRatingChartComponent implements OnChanges {
  distribution = input.required<IStarRatingChartDistribution[]>();

  protected sum: number = 0;

  constructor() {}

  ngOnChanges(): void {
    console.log(this.distribution(), this.distribution().length);
    if (!this.distribution()) {
      return;
    }

    this.sum = this.distribution().reduce(
      (acc, element) => acc + element.value,
      0
    );
  }
}
