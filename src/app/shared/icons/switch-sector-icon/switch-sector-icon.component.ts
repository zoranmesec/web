import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
    selector: 'app-switch-sector-icon',
    standalone: false,
    templateUrl: './switch-sector-icon.component.html',
    styleUrl: './switch-sector-icon.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SwitchSectorIconComponent {
    disabled = input<boolean>(false);
}
