import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-publish-icon',
  standalone: false,
  templateUrl: './publish-icon.component.html',
  styleUrl: './publish-icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublishIconComponent {

}
