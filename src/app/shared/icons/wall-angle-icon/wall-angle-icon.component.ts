import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { WallAngle } from 'src/app/types/wall-angle';

@Component({
    selector: 'app-wall-angle-icon',
    standalone: false,
    templateUrl: './wall-angle-icon.component.html',
    styleUrl: './wall-angle-icon.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WallAngleIconComponent {
    protected wallAngles = WallAngle;
    wallAngle = input.required<WallAngle>();
    active = input<boolean>(false);
}
