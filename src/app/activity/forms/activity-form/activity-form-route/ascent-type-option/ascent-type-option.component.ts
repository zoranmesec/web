import { Component, input } from '@angular/core';
import { IconsModule } from 'src/app/shared/icons/icons.module';
import { AscentType } from 'src/app/types/ascent-type';

@Component({
    selector: 'app-ascent-type-option',
    imports: [IconsModule],
    templateUrl: './ascent-type-option.component.html',
    styleUrl: './ascent-type-option.component.scss'
})
export class AscentTypeOptionComponent {
    ascentType = input.required<AscentType>();
    selected = input<boolean>(false);
    disabled = input<boolean>(false);
    protected active = false;

    toggleActive() {
        this.active = !this.active;
    }
}
