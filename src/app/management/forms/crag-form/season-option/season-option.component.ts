import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconsModule } from 'src/app/shared/icons/icons.module';
import { Season } from 'src/app/types/season';

@Component({
    selector: 'app-season-option',
    imports: [IconsModule],
    templateUrl: './season-option.component.html',
    styleUrl: './season-option.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SeasonOptionComponent {
    season = input.required<Season>();
    selected = input<boolean>(false);
    disabled = input<boolean>(false);
    protected active = false;

    toggleActive() {
        this.active = !this.active;
    }
}
