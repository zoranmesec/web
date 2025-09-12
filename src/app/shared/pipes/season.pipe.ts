import { Pipe, PipeTransform } from '@angular/core';

export enum Season {
  winter = 'zima',
  spring = 'pomlad',
  summer = 'poletje',
  autumn = 'jesen',
}

@Pipe({
  name: 'season',
  standalone: true,
})
export class SeasonPipe implements PipeTransform {
  transform(value: string): string {
    return Season[value as keyof typeof Season] || '';
  }
}
