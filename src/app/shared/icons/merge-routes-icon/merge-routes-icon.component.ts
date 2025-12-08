import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
    selector: 'app-merge-routes-icon',
    standalone: false,
    templateUrl: './merge-routes-icon.component.html',
    styleUrl: './merge-routes-icon.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MergeRoutesIconComponent {
    sgDisabled = input<boolean>(false);
}
