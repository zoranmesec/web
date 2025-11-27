import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
    name: 'barColor',
    standalone: true
})
export class BarColorPipe implements PipeTransform {
    transform(value: number, useColorBars = true): string {
        if (useColorBars) {
            return `rgba(${Math.abs((255 * value) / 100 - 255)}, ${Math.abs((150 * value) / 100 - 255)}, 243, 1)`;
        } else {
            if (value === 100) {
                return `#2B7FD9`;
            } else {
                return `#e5e5e5`;
            }
        }
    }
}
