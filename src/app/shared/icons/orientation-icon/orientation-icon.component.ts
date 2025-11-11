import {
  ChangeDetectionStrategy,
  Component,
  input,
  OnInit,
} from '@angular/core';
import { Orientation } from 'src/generated/graphql';

@Component({
  selector: 'app-orientation-icon',
  templateUrl: './orientation-icon.component.html',
  styleUrls: ['./orientation-icon.component.scss'],
  standalone: true,
  host: { style: 'display:flex' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrientationIconComponent implements OnInit {
  orientations = input.required<Orientation[]>();

  protected Orientation = Orientation;
  constructor() {}

  ngOnInit(): void {}
}
