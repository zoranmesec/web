import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconSize } from '../icon-size.enum';

@Component({
    selector: 'app-approach-icon',
    standalone: false,
    templateUrl: './approach-icon.component.html',
    styleUrl: './approach-icon.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApproachIconComponent {
    size = input<IconSize>(IconSize.large);
}
