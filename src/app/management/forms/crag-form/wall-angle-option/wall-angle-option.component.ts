import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconsModule } from 'src/app/shared/icons/icons.module';
import { WallAngle } from 'src/app/types/wall-angle';

@Component({
    selector: 'app-wall-angle-option',
    imports: [IconsModule],
    templateUrl: './wall-angle-option.component.html',
    styleUrl: './wall-angle-option.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WallAngleOptionComponent {
    wallAngle = input.required<WallAngle>();
    selected = input<boolean>(false);
    disabled = input<boolean>(false);
    protected active = false;

    toggleActive() {
        this.active = !this.active;
    }
}
