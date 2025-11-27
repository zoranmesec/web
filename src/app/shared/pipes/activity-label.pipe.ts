import { Pipe, PipeTransform } from '@angular/core';
import { ACTIVITY_TYPES } from 'src/app/common/activity.constants';
import { Activity } from 'src/generated/graphql';
@Pipe({
    name: 'activityLabel'
})
export class ActivityLabelPipe implements PipeTransform {
    transform(activity: Activity) {
        const activityTypes = ACTIVITY_TYPES;
        const activityType = activityTypes.find((type) => type.value === activity.type);
        return activityType ? activityType.label : 'Neznano';
    }
}
