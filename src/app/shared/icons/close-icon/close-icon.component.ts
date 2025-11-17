import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-close-icon',
  standalone: false,
  templateUrl: './close-icon.component.html',
  styleUrl: './close-icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CloseIconComponent {

}
