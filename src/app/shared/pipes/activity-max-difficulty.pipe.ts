import { inject, Pipe, PipeTransform } from '@angular/core';
import { ActivityRoute } from 'src/generated/graphql';
import { GradingSystemsService } from '../services/grading-systems.service';
@Pipe({
    name: 'activityMaxDifficulty'
})
export class ActivityMaxDifficultyPipe implements PipeTransform {
    private readonly gradingSystemsService = inject(GradingSystemsService);
    async transform(routes: ActivityRoute[]) {
        const maxDifficulty = routes.reduce((max, route) => {
            const routeDifficulty = route.route.difficulty;
            return routeDifficulty > max ? routeDifficulty : max;
        }, 0);
        const gradeLabel = await this.gradingSystemsService.diffToGrade(maxDifficulty, 'french');
        return gradeLabel.name;
    }
}
