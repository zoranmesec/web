import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-wall-icon',
  standalone: false,
  templateUrl: './wall-icon.component.html',
  styleUrl: './wall-icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WallIconComponent {

}
