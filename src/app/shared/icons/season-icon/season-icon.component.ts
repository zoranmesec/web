import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Season } from 'src/app/types/season';

@Component({
    selector: 'app-season-icon',
    standalone: false,
    templateUrl: './season-icon.component.html',
    styleUrl: './season-icon.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SeasonIconComponent {
    protected seasons = Season;
    season = input.required<Season>();
    active = input<boolean>(false);
}
