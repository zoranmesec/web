import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
    selector: 'app-more-icon',
    standalone: false,
    templateUrl: './more-icon.component.html',
    styleUrl: './more-icon.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MoreIconComponent {
    size = input<'small' | 'regular'>('regular');
}
