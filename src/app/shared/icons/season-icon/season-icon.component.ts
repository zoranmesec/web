import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Season as FormattedSeason } from 'src/app/types/season';
import { Season } from 'src/generated/graphql';

@Component({
    selector: 'app-season-icon',
    standalone: false,
    templateUrl: './season-icon.component.html',
    styleUrl: './season-icon.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SeasonIconComponent {
    protected seasons = FormattedSeason;
    season = input.required<Season>();
    active = input<boolean>(false);

    get formattedSeason(): FormattedSeason {
        return FormattedSeason[this.season()];
    }
}
