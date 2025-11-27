import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Orientation } from 'src/generated/graphql';

@Component({
    selector: 'app-orientation-icon',
    templateUrl: './orientation-icon.component.html',
    styleUrls: ['./orientation-icon.component.scss'],
    standalone: false,
    host: { style: 'display:flex' },
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrientationIconComponent  {
    orientations = input.required<Orientation[]>();

    protected Orientation = Orientation;
    
}
