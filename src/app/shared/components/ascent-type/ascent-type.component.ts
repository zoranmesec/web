import { CommonModule } from '@angular/common';
import { Component, computed, input, Signal } from '@angular/core';
import { AscentType } from 'src/app/types/ascent-type';
import { ASCENT_TYPES } from '../../../common/activity.constants';
import { IconsModule } from '../../icons/icons.module';

@Component({
    selector: 'app-ascent-type',
    templateUrl: './ascent-type.component.html',
    styleUrls: ['./ascent-type.component.scss'],
    imports: [CommonModule, IconsModule],
    standalone: true
})
export class AscentTypeComponent {
    value = input.required<string>();
    displayType = input('text');
    iconAlignment = input('end');
    fixedIconsWidth = input(true);

    ascentType: Signal<AscentType> = computed(() => {
        return ASCENT_TYPES.find((at) => at.value === this.value());
    });
}
