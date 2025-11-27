import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
    selector: 'app-plus-icon',
    standalone: false,
    templateUrl: './plus-icon.component.html',
    styleUrl: './plus-icon.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlusIconComponent {
    disabled = input<boolean>(false);
}
