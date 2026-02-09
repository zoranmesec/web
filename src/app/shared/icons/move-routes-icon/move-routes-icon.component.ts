import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
    selector: 'app-move-routes-icon',
    standalone: false,
    templateUrl: './move-routes-icon.component.html',
    styleUrl: './move-routes-icon.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MoveRoutesIconComponent {
    sgDisabled = input<boolean>(false);
}
