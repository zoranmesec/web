import { Component, Input } from '@angular/core';
import { IconsModule } from 'src/app/shared/icons/icons.module';

@Component({
    selector: 'app-sortable-header-field',
    templateUrl: './sortable-header-field.component.html',
    styleUrls: ['./sortable-header-field.component.scss'],
    imports: [IconsModule]
})
export class SortableHeaderFieldComponent {
    @Input() field: string;
    @Input() label?: string;
    @Input() icon?: string;
    @Input() svgIcon?: string;
    @Input() centered = false;
    @Input() sortIndication: 'highlight' | 'arrows';
    @Input() currentSortDirection?: number;
    @Input() currentlySortedField: string;
}
