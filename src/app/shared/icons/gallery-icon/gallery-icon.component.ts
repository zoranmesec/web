import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-gallery-icon',
  imports: [],
  templateUrl: './gallery-icon.component.html',
  styleUrl: './gallery-icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GalleryIconComponent {
  active = input<boolean>(false);
}
