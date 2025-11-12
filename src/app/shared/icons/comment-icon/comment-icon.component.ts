import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-comment-icon',
  standalone: false,
  templateUrl: './comment-icon.component.html',
  styleUrl: './comment-icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommentIconComponent {
  active = input<boolean>(false);
}
