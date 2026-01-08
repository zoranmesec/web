import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SignalPipe } from '../../pipes/signal.pipe';

@Component({
    selector: 'app-title',
    imports: [SignalPipe],
    templateUrl: './title.component.html',
    styleUrl: './title.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleComponent {
    title = input.required<string>();
}
