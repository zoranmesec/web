import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BreakpointService } from 'src/app/services/breakpoint.service';
import { IconsModule } from 'src/app/shared/icons/icons.module';
import { SignalPipe } from 'src/app/shared/pipes/signal.pipe';
import { Tab } from 'src/app/types/tab';

@Component({
    selector: 'app-activity-header',
    templateUrl: './activity-header.component.html',
    styleUrls: ['./activity-header.component.scss'],
    imports: [MatTabsModule, RouterModule, IconsModule, SignalPipe],
    changeDetection: ChangeDetectionStrategy.Default
})
export class ActivityHeaderComponent {
    active = input.required<string>();

    tabs: Tab[] = [
        {
            slug: 'dnevnik',
            label: 'Koledar',
            icon: 'calendar'
        },
        {
            slug: 'vzponi',
            label: 'Vzponi',
            icon: 'ascents'
        },
        {
            slug: 'statistika',
            label: 'Statistika',
            icon: 'statistics'
        }
    ];

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        protected readonly breakpointService: BreakpointService
    ) {}

    setActiveTab(tab: Tab) {
        this.router.navigate(['../' + tab.slug], {
            relativeTo: this.activatedRoute
        });
    }
}
