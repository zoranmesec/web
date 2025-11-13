import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-minus-icon',
  standalone: false,
  templateUrl: './minus-icon.component.html',
  styleUrl: './minus-icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MinusIconComponent {
  disabled = input<boolean>(false);
}
