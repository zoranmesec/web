import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'barColor',
  standalone: true,
})
export class BarColorPipe implements PipeTransform {
  transform(value: number): string {
    return `rgba(${Math.abs((255 * value) / 100 - 255)}, ${Math.abs(
      (150 * value) / 100 - 255
    )}, 243, 1)`;
  }
}
