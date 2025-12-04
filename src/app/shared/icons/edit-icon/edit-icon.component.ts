import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
    selector: 'app-edit-icon',
    standalone: false,
    templateUrl: './edit-icon.component.html',
    styleUrl: './edit-icon.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditIconComponent {
    disabled = input<boolean>(false);
}
