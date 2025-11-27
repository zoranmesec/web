import { Pipe, PipeTransform } from '@angular/core';
import { Season } from 'src/app/types/season';
@Pipe({
    name: 'season',
    standalone: true
})
export class SeasonPipe implements PipeTransform {
    transform(value: string): string {
        return Season[value as keyof typeof Season] || '';
    }
}
