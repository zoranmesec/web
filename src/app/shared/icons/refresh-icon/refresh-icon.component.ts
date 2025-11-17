import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-refresh-icon',
  standalone: false,
  templateUrl: './refresh-icon.component.html',
  styleUrl: './refresh-icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RefreshIconComponent {

}
