import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Orientation } from 'src/generated/graphql';
import { IconSize } from '../icon-size.enum';

@Component({
    selector: 'app-orientation-icon',
    templateUrl: './orientation-icon.component.html',
    styleUrls: ['./orientation-icon.component.scss'],
    standalone: false,
    host: { style: 'display:flex' },
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrientationIconComponent {
    sgOrientations = input.required<Orientation[]>();
    size = input<IconSize>(IconSize.large);
    protected Orientation = Orientation;
    protected iconSize = IconSize;
}
