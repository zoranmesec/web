import { Component, OnInit, Input } from '@angular/core';
// import { Grade } from '../grade';
import {
  GradingSystemsService,
  IGrade,
} from '../../services/grading-systems.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-grade',
  templateUrl: './grade.component.html',
  styleUrls: ['./grade.component.scss'],
  imports: [CommonModule, MatIconModule],
  standalone: true,
})
export class GradeComponent implements OnInit {
  @Input() difficulty: number;
  @Input() gradingSystemId: string;
  @Input() showModifier: boolean = false;
  @Input() legacy: boolean = false;
  @Input() disabled: boolean = false;

  // grade: Grade;
  grade: IGrade;
  modifier: number = 0;

  gradeLetters = ['a', 'a+', 'b', 'b+', 'c', 'c+'];

  constructor(private GradingSystemsService: GradingSystemsService) {}

  ngOnInit(): void {
    if (this.difficulty != null) {
      this.GradingSystemsService.diffToGrade(
        this.difficulty,
        this.gradingSystemId,
        this.legacy
      ).then((grade) => {
        this.grade = grade;
      });
    }
  }
}
