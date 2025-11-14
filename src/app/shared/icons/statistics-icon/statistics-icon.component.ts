import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-statistics-icon',
  standalone: false,
  templateUrl: './statistics-icon.component.html',
  styleUrl: './statistics-icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatisticsIconComponent {
  active = input<boolean>(false);
}
