import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-drag-icon',
  standalone: false,
  templateUrl: './drag-icon.component.html',
  styleUrl: './drag-icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DragIconComponent {

}
