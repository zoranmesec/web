import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
    selector: 'app-routes-icon',
    standalone: false,
    templateUrl: './routes-icon.component.html',
    styleUrl: './routes-icon.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoutesIconComponent {
    active = input<boolean>(false);
    disabled = input<boolean>(false);
}
