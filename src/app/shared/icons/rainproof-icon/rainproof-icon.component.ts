import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconSize } from '../icon-size.enum';

@Component({
    selector: 'app-rainproof-icon',
    standalone: false,
    templateUrl: './rainproof-icon.component.html',
    styleUrl: './rainproof-icon.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RainproofIconComponent {
    size = input<IconSize>(IconSize.large);
}
