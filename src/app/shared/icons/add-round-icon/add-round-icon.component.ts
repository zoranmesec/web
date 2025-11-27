import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'app-add-round-icon',
    standalone: false,
    templateUrl: './add-round-icon.component.html',
    styleUrl: './add-round-icon.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddRoundIconComponent {}
