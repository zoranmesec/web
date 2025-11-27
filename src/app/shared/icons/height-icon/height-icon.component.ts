import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'app-height-icon',
    standalone: false,
    templateUrl: './height-icon.component.html',
    styleUrl: './height-icon.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeightIconComponent {}
