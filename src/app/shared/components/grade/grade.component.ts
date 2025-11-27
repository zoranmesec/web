import { ChangeDetectionStrategy, ChangeDetectorRef, Component, input, OnChanges } from '@angular/core';
// import { Grade } from '../grade';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { SignalPipe } from '../../pipes/signal.pipe';
import { GradingSystemsService, IGrade } from '../../services/grading-systems.service';

@Component({
    selector: 'app-grade',
    templateUrl: './grade.component.html',
    styleUrls: ['./grade.component.scss'],
    imports: [CommonModule, MatIconModule, SignalPipe],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GradeComponent implements OnChanges {
    difficulty = input.required<number>();
    gradingSystemId = input.required<string>();
    showModifier = input<boolean>(false);
    legacy = input<boolean>(false);
    disabled = input<boolean>(false);

    grade: IGrade;
    modifier = 0;

    gradeLetters = ['a', 'a+', 'b', 'b+', 'c', 'c+'];

    constructor(
        private GradingSystemsService: GradingSystemsService,
        private changeDetectorRef: ChangeDetectorRef
    ) {}

    async ngOnChanges(_changes): Promise<void> {
        if (this.difficulty() !== null) {
            this.grade = await this.GradingSystemsService.diffToGrade(this.difficulty(), this.gradingSystemId(), this.legacy());
            this.changeDetectorRef.markForCheck();
        }
    }
}
