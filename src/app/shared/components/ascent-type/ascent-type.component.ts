import {
  Component,
  computed,
  input,
  Input,
  OnInit,
  Signal,
} from '@angular/core';
import { Registry } from 'src/app/types/registry';
import { ASCENT_TYPES } from '../../../common/activity.constants';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from 'ng-flex-layout';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { IconsModule } from '../../icons/icons.module';
import { AscentType } from 'src/app/types/ascent-type';

@Component({
  selector: 'app-ascent-type',
  templateUrl: './ascent-type.component.html',
  styleUrls: ['./ascent-type.component.scss'],
  imports: [CommonModule, IconsModule],
  standalone: true,
})
export class AscentTypeComponent {
  value = input.required<string>();
  displayType = input('text');
  iconAlignment = input('end');
  fixedIconsWidth = input(true);

  ascentType: Signal<AscentType | undefined> = computed(() => {
    return ASCENT_TYPES.find((at) => at.value === this.value());
  });
}
