import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-check-icon',
  standalone: false,
  templateUrl: './check-icon.component.html',
  styleUrl: './check-icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckIconComponent {

}
