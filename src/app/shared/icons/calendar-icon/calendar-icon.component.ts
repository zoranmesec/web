import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
    selector: 'app-calendar-icon',
    standalone: false,
    templateUrl: './calendar-icon.component.html',
    styleUrl: './calendar-icon.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CalendarIconComponent {
    active = input<boolean>(false);
}
