import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { WallAngle as FormattedWallAngle } from 'src/app/types/wall-angle';
import { WallAngle } from 'src/generated/graphql';

@Component({
    selector: 'app-wall-angle-icon',
    standalone: false,
    templateUrl: './wall-angle-icon.component.html',
    styleUrl: './wall-angle-icon.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WallAngleIconComponent {
    protected wallAngles = FormattedWallAngle;
    wallAngle = input.required<WallAngle>();
    active = input<boolean>(false);

    get formattedWallAngle(): FormattedWallAngle {
        return FormattedWallAngle[this.wallAngle()];
    }
}
