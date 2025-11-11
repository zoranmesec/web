import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-routes-icon',
  imports: [],
  templateUrl: './routes-icon.component.html',
  styleUrl: './routes-icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoutesIconComponent {
  active = input<boolean>(false);
}
