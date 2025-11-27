import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { DistributionChartComponent, IDistribution } from 'src/app/common/distribution-chart/distribution-chart.component';
import { GradeComponent } from 'src/app/shared/components/grade/grade.component';
import { GradeDistributionService } from 'src/app/shared/services/grade-distribution.service';
import { DifficultyVote } from 'src/generated/graphql';

@Component({
    selector: 'app-route-grades',
    templateUrl: './route-grades.component.html',
    styleUrls: ['./route-grades.component.scss'],
    standalone: true,
    imports: [CommonModule, MatExpansionModule, GradeComponent, DistributionChartComponent]
})
export class RouteGradesComponent implements OnInit {
    @Input() grades: DifficultyVote[] = [];
    @Input() difficulty: string;
    @Input() gradingSystemId: string;
    gradesDistribution: IDistribution[] = [];
    constructor(private gradeDistributionService: GradeDistributionService) {}

    ngOnInit(): void {
        if (this.grades) {
            this.gradeDistributionService.getDistribution(this.grades, this.gradingSystemId).then((dist: IDistribution[]) => {
                this.gradesDistribution = dist;
            });
        }
    }
}
