import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'app-star-full-icon',
    standalone: false,
    templateUrl: './star-full-icon.component.html',
    styleUrl: './star-full-icon.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class StarFullIconComponent {}
