import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-today-icon',
  standalone: false,
  templateUrl: './today-icon.component.html',
  styleUrl: './today-icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodayIconComponent {

}
