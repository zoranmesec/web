import {
  ChangeDetectionStrategy,
  Component,
  input,
  Input,
  OnInit,
} from '@angular/core';
import { MatTabNavPanel, MatTabsModule } from '@angular/material/tabs';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterModule,
} from '@angular/router';
import { IconsModule } from 'src/app/shared/icons/icons.module';
import { Tab } from 'src/app/types/tab';

@Component({
  selector: 'app-activity-header',
  templateUrl: './activity-header.component.html',
  styleUrls: ['./activity-header.component.scss'],
  imports: [MatTabsModule, RouterModule, IconsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityHeaderComponent implements OnInit {
  active = input.required<string>();

  tabs: Array<Tab> = [
    {
      slug: 'dnevnik',
      label: 'Koledar',
      icon: 'calendar',
    },
    {
      slug: 'vzponi',
      label: 'Vzponi',
      icon: 'ascents',
    },
    {
      slug: 'statistika',
      label: 'Statistika',
      icon: 'statistics',
    },
  ];

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {}

  setActiveTab(tab: Tab) {
    this.router.navigate(['../' + tab.slug], {
      relativeTo: this.activatedRoute,
    });
  }
}
