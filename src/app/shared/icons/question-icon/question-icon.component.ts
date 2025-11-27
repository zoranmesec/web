import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'app-question-icon',
    standalone: false,
    templateUrl: './question-icon.component.html',
    styleUrl: './question-icon.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuestionIconComponent {}
