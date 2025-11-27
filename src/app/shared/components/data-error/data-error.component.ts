import { Component, Input } from '@angular/core';
import { DataError } from 'src/app/types/data-error';

@Component({
    selector: 'app-data-error',
    standalone: true,
    templateUrl: './data-error.component.html',
    styleUrls: ['./data-error.component.scss'],
    imports: []
})
export class DataErrorComponent {
    @Input() error: DataError;

}
