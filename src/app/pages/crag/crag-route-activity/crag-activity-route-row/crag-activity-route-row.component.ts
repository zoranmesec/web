import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { PUBLISH_OPTIONS } from 'src/app/common/activity.constants';
import { AscentPublishOptionComponent } from 'src/app/shared/components/ascent-publish-option/ascent-publish-option.component';
import { AscentTypeComponent } from 'src/app/shared/components/ascent-type/ascent-type.component';
import { ActivityRoute } from 'src/generated/graphql';

@Component({
    selector: '[app-crag-activity-route-row]',
    templateUrl: './crag-activity-route-row.component.html',
    styleUrls: ['./crag-activity-route-row.component.scss'],
    standalone: true,
    imports: [AscentTypeComponent, CommonModule, AscentPublishOptionComponent]
})
export class CragActivityRouteRowComponent  {
    @Input() route: ActivityRoute;
    @Input() displayType: 'activity' | 'activityForm' | 'routes' = 'routes';
    @Input() noNotes = false;
    @Input() noTopropeOnPage = false;

    publishOptions = PUBLISH_OPTIONS;

}
