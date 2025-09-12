import { Pipe, PipeTransform } from '@angular/core';

export enum WallAngle {
  slab = 'plata',
  vertical = 'navpično',
  overhang = 'previs',
  roof = 'streha',
}

@Pipe({
  name: 'wallAngle',
  standalone: true,
})
export class WallAnglePipe implements PipeTransform {
  transform(value: string): string {
    return WallAngle[value as keyof typeof WallAngle] || '';
  }
}
