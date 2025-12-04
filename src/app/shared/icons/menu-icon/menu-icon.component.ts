import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-menu-icon',
  standalone: false,
  templateUrl: './menu-icon.component.html',
  styleUrl: './menu-icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuIconComponent {

}
