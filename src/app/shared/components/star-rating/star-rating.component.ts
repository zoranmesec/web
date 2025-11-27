import { Component, input } from '@angular/core';

import { MatIconModule } from '@angular/material/icon';
import { SignalPipe } from '../../pipes/signal.pipe';
import { StarRatingEnum } from './star-rating.enum';

@Component({
    selector: 'app-star-rating',
    templateUrl: './star-rating.component.html',
    styleUrls: ['./star-rating.component.scss'],
    imports: [MatIconModule, SignalPipe],
    standalone: true
})
export class StarRatingComponent {
    value = input.required<number | null>();
    showLabel = input<boolean>(false);
    doNotShowZeroLabel = input<boolean>(true);
    protected starRatingEnum = StarRatingEnum;
}
