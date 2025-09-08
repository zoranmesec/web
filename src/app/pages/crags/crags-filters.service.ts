import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CragsFiltersService {
  private routeTypes = signal<string[]>(['sportne']);
  private areas = signal<string[]>([]);
  constructor() {}

  get allRouteTypes() {
    return this.routeTypes.asReadonly();
  }

  get allAreas() {
    return this.areas.asReadonly();
  }

  toggleRouteType(routeType: string) {
    this.routeTypes.update((current) =>
      current.includes(routeType)
        ? current.filter((type) => type !== routeType)
        : [...current, routeType]
    );
  }

  toggleArea(area: string) {
    this.areas.update((current) =>
      current.includes(area)
        ? current.filter((a) => a !== area)
        : [...current, area]
    );
  }
}
