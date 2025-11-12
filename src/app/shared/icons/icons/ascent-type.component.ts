import {
  ChangeDetectionStrategy,
  Component,
  input,
  OnInit,
} from '@angular/core';
import { AscentType } from 'src/app/types/ascent-type';
import { AscentType as GeneratedAscentType } from 'src/generated/graphql';

@Component({
  selector: 'app-ascent-type-icon',
  standalone: false,
  templateUrl: './ascent-type-icon.component.html',
  styleUrl: './ascent-type-icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AscentTypeIconComponent {
  ascentType = input.required<AscentType>();
  active = input<boolean>(false);
  size = input<'small' | 'regular'>('regular');
}
