import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
    name: 'includes',
    standalone: true
})
export class IncludesPipe<T> implements PipeTransform {
    transform(arr: T[], value: T): boolean {
        return arr.includes(value);
    }
}
