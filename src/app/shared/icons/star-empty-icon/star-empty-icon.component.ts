import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'app-star-empty-icon',
    standalone: false,
    templateUrl: './star-empty-icon.component.html',
    styleUrl: './star-empty-icon.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class StarEmptyIconComponent {}
