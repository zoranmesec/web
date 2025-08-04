import { Component, Input, OnInit } from '@angular/core';
import { MatTabNavPanel, MatTabsModule } from '@angular/material/tabs';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-activity-header',
  templateUrl: './activity-header.component.html',
  styleUrls: ['./activity-header.component.scss'],
  imports: [MatTabsModule, RouterLink],
  standalone: true,
})
export class ActivityHeaderComponent implements OnInit {
  @Input() active: string;

  constructor() {}

  ngOnInit(): void {}
}
