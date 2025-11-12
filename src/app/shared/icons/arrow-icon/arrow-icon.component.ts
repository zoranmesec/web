import { Component, input } from '@angular/core';

@Component({
  selector: 'app-arrow-icon',
  standalone: false,
  templateUrl: './arrow-icon.component.html',
  styleUrl: './arrow-icon.component.scss',
})
export class ArrowIconComponent {
  direction = input<'left' | 'right'>('left');
}
