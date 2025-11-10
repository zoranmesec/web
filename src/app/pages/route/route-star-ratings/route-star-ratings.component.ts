import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  OnInit,
} from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { StarRatingVote } from 'src/generated/graphql';
import { StarRatingComponent } from 'src/app/shared/components/star-rating/star-rating.component';
import {
  IStarRatingChartDistribution,
  StarRatingChartComponent,
} from 'src/app/common/star-rating-chart/star-rating-chart.component';

interface IGrade {
  user: {
    firstname: string;
    lastname: string;
  };
  grade: number; // TODO difficulty instead of grade
  created: string;
  updated: string;
}

@Component({
  selector: 'app-route-star-ratings',
  templateUrl: './route-star-ratings.component.html',
  styleUrls: ['./route-star-ratings.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatExpansionModule,
    StarRatingComponent,
    StarRatingChartComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RouteStarRatingsComponent implements OnInit {
  votes = input.required<StarRatingVote[]>();

  protected starRatingsDistribution: IStarRatingChartDistribution[] = [];
  constructor() {}

  ngOnInit(): void {
    const distributionMap: { [key: number]: number } = {};
    this.votes().forEach((vote) => {
      const stars = vote.stars;
      if (distributionMap[stars]) {
        distributionMap[stars]++;
      } else {
        distributionMap[stars] = 1;
      }
    });
    this.starRatingsDistribution = Object.keys(distributionMap).map((key) => ({
      stars: Number(key),
      value: distributionMap[Number(key)],
    }));

    // fake values
    this.starRatingsDistribution.push();

    // sort by stars descending
    this.starRatingsDistribution.sort((a, b) => b.stars - a.stars);
  }
}
