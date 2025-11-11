import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-comment-icon',
  imports: [],
  templateUrl: './comment-icon.component.html',
  styleUrl: './comment-icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommentIconComponent {
  active = input<boolean>(false);
}
