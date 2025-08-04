import { Component, OnInit } from '@angular/core';
import { LayoutService } from 'src/app/services/layout.service';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-changelog',
  standalone: true,
  templateUrl: './changelog.component.html',
  styleUrls: ['./changelog.component.scss'],
  imports: [MatCard, MatIcon, RouterLink],
})
export class ChangelogComponent implements OnInit {
  constructor(private layoutService: LayoutService) {}

  ngOnInit(): void {
    this.layoutService.$breadcrumbs.next([
      {
        name: 'Dnevnik sprememb',
      },
    ]);
  }
}
