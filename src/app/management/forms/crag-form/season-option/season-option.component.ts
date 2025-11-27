import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { IconsModule } from 'src/app/shared/icons/icons.module';
import { Season } from 'src/generated/graphql';
import { SeasonData } from '../crag-form.component';

@Component({
    selector: 'app-season-option',
    imports: [IconsModule],
    templateUrl: './season-option.component.html',
    styleUrl: './season-option.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SeasonOptionComponent {
    seasonData = input.required<SeasonData>();

    disabled = input<boolean>(false);
    seasonFormControl = input.required<FormControl<Season[]>>();
    protected active = false;

    toggleActive() {
        this.active = !this.active;
    }

    protected selectSeason() {
        const currentValues: Season[] = this.seasonFormControl().value || [];
        if (currentValues.includes(this.seasonData().season)) {
            // Remove season
            this.seasonFormControl().setValue(currentValues.filter((s) => s !== this.seasonData().season));
        } else {
            // Add season
            this.seasonFormControl().setValue([...currentValues, this.seasonData().season]);
        }
    }

    get selected(): boolean {
        const currentValues: Season[] = this.seasonFormControl().value || [];
        return currentValues.includes(this.seasonData().season);
    }
}
