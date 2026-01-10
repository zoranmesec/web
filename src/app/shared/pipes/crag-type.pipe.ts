import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
    name: 'cragType',
    standalone: true
})
export class CragTypePipe implements PipeTransform {
    transform(cragType: string): string {
        switch (cragType) {
            case 'sport':
                return 'športno plezanje';
            case 'alpine':
                return 'alpinistično plezanje';
            default:
                return '';
        }
    }
}
