import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
    selector: 'app-gallery-icon',
    standalone: false,
    templateUrl: './gallery-icon.component.html',
    styleUrl: './gallery-icon.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GalleryIconComponent {
    sgActive = input<boolean>(false);
}
