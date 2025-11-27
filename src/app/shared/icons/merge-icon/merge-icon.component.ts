import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'app-merge-icon',
    standalone: false,
    templateUrl: './merge-icon.component.html',
    styleUrl: './merge-icon.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MergeIconComponent {}
