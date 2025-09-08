import { Pipe, PipeTransform } from '@angular/core';
import { ROUTE_TYPES } from 'src/app/common/route-types.constants';
@Pipe({
  name: 'routeType',
})
export class RouteTypePipe implements PipeTransform {
  transform(routeType: string) {
    const routeTypeObj = ROUTE_TYPES.find((rt) => rt.id === routeType);
    if (routeTypeObj) {
      return routeTypeObj.label.toLowerCase();
    } else {
      return '';
    }
  }
}
