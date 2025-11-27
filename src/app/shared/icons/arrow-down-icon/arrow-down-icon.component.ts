import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'app-arrow-down-icon',
    standalone: false,
    templateUrl: './arrow-down-icon.component.html',
    styleUrl: './arrow-down-icon.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArrowDownIconComponent {}
