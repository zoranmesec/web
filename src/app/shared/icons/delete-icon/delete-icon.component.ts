import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
    selector: 'app-delete-icon',
    standalone: false,
    templateUrl: './delete-icon.component.html',
    styleUrl: './delete-icon.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeleteIconComponent {
    disabled = input<boolean>(false);
}
