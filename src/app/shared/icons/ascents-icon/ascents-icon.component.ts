import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-ascents-icon',
  standalone: false,
  templateUrl: './ascents-icon.component.html',
  styleUrl: './ascents-icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AscentsIconComponent {
  active = input<boolean>(false);
}
