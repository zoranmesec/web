import {
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import {
  ASCENT_TYPES,
  PUBLISH_OPTIONS,
} from '../../../../common/activity.constants';
import { Crag } from 'src/generated/graphql';
import { Subject, takeUntil } from 'rxjs';
import { ActivityFormService } from '../activity-form.service';
import { GradeSelectComponent } from 'src/app/shared/components/grade-select/grade-select.component';
import {
  MatFormField,
  MatLabel,
  MatHint,
  MatFormFieldModule,
} from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { IconsModule } from 'src/app/shared/icons/icons.module';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { AscentTypeOptionComponent } from './ascent-type-option/ascent-type-option.component';
import { MatDividerModule } from '@angular/material/divider';
import { MatRadioModule } from '@angular/material/radio';

@Component({
  selector: 'app-activity-form-route',
  templateUrl: './activity-form-route.component.html',
  styleUrls: ['./activity-form-route.component.scss'],
  imports: [
    GradeSelectComponent,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatIconModule,
    MatHint,
    CommonModule,
    MatInputModule,
    MatButtonModule,
    RouterModule,
    IconsModule,
    MatButtonToggleModule,
    AscentTypeOptionComponent,
    MatDividerModule,
    MatRadioModule,
  ],
})
export class ActivityFormRouteComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  @Input() myIndex: number;
  activity = true;
  @Input() route: FormGroup;
  @Input() first: boolean;
  @Input() last: boolean;
  @Input() crag: Crag;

  topRopeAscentTypes = ASCENT_TYPES.filter((ascentType) => ascentType.topRope);
  nonTopRopeAscentTypes = ASCENT_TYPES.filter(
    (ascentType) => !ascentType.topRope
  );

  protected topRope = false;

  publishOptions = PUBLISH_OPTIONS;

  protected selectTopRope = false;

  constructor(
    public activityFormService: ActivityFormService,

    private readonly changeDetectorRef: ChangeDetectorRef
  ) {}

  get ascentTypes() {
    if (this.route.get('topRope').value) {
      return this.topRopeAscentTypes;
    } else {
      return this.nonTopRopeAscentTypes;
    }
  }

  ngOnInit(): void {
    // Should disable possibility to vote on route difficulty if ascent type not a tick and if ascent visibility publish type is not public (public, log)
    this.route.controls.publish.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.activityFormService.conditionallyDisableVotedDifficultyInputs();
      });

    // Revalidate stuff when ascentType is changed (also triggered on load when ascentType fields are populated)
    this.route.get('ascentType').valueChanges.subscribe((ascentType) => {
      this.changeDetectorRef.markForCheck();
      this.activityFormService.revalidateAscentTypes();
      this.activityFormService.conditionallyDisableVotedDifficultyInputs();
      this.activityFormService.conditionallyDisableVotedStarRatingInputs();

      if (this.route.get('isProject').value) {
        this.conditionallyRequireVotedDifficulty(ascentType);
      }
    });
  }

  /**
   * If a route is a project and selected ascent type is a tick, then a vote on grade is mandatory.
   */
  conditionallyRequireVotedDifficulty(ascentTypeSelected: string) {
    const isTick = ASCENT_TYPES.some(
      (at) => at.value === ascentTypeSelected && at.tick
    );
    if (isTick) {
      // votedDifficulty might be didabled, and disabled fields are skipped from validation. Thus need to add validation function to formGroup level instead
      this.route.setValidators((formGroup) =>
        Validators.required(formGroup.get('votedDifficulty'))
      );
    } else {
      this.route.clearValidators();
    }
    this.route.updateValueAndValidity();
  }

  /**
   * determines if a log could ever be possible based on route type and some ascent type
   */
  logPossibleEver(ascentType: string) {
    if (
      this.route.value.type === 'boulder' &&
      ['onsight', 't_onsight'].includes(ascentType)
    ) {
      return false;
    }
    return true;
  }

  /**
   * Map trigger value for ascent type select (so it includes toprope so there can be no confusion)
   */
  // mapAscentTypeValueToFullLabel(ascentTypeSelected: string) {
  //   const ascentType = ASCENT_TYPES.find(
  //     (at) => at.value === ascentTypeSelected
  //   );

  //   if (ascentType != null) {
  //     return ascentType.label + (ascentType.topRope ? ' (top rope)' : '');
  //   }

  //   return ascentType;
  // }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
