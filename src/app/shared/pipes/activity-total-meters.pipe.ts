import { Pipe, PipeTransform } from '@angular/core';
import { ActivityRoute } from 'src/generated/graphql';
@Pipe({
    name: 'activityTotalMeters'
})
export class ActivityTotalMetersPipe implements PipeTransform {
    transform(routes: ActivityRoute[]) {
        return routes.reduce((acc, route) => acc + route.route.length, 0);
    }
}
