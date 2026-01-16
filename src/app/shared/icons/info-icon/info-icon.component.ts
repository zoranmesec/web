import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
    selector: 'app-info-icon',
    standalone: false,
    templateUrl: './info-icon.component.html',
    styleUrl: './info-icon.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InfoIconComponent {
    sgActive = input<boolean>(false);
}
