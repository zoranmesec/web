import { Component, Input, OnInit } from '@angular/core';
import { Orientation } from 'src/generated/graphql';

@Component({
  selector: 'app-orientation-icon',
  templateUrl: './orientation.component.html',
  styleUrls: ['./orientation.component.scss'],
  standalone: true,
  host: { style: 'display:flex' },
})
export class OrientationIconComponent implements OnInit {
  @Input() orientations!: Orientation[];

  protected Orientation = Orientation;
  constructor() {}

  ngOnInit(): void {}
}
