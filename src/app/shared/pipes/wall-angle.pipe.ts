import { Pipe, PipeTransform } from '@angular/core';
import { WallAngle } from 'src/app/types/wall-angle';

@Pipe({
    name: 'wallAngle',
    standalone: true
})
export class WallAnglePipe implements PipeTransform {
    transform(value: string): string {
        return WallAngle[value as keyof typeof WallAngle] || '';
    }
}
