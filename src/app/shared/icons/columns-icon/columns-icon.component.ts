import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'app-columns-icon',
    standalone: false,
    templateUrl: './columns-icon.component.html',
    styleUrl: './columns-icon.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ColumnsIconComponent {}
