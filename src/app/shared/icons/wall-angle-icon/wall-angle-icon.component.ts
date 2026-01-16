import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { WallAngle as FormattedWallAngle } from 'src/app/types/wall-angle';
import { WallAngle } from 'src/generated/graphql';
import { IconSize } from '../icon-size.enum';

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
    sgActive = input<boolean>(false);
    size = input<IconSize>(IconSize.large);
    disabled = input<boolean>(false);

    protected iconSize = IconSize;

    get formattedWallAngle(): FormattedWallAngle {
        return FormattedWallAngle[this.wallAngle()];
    }
}
