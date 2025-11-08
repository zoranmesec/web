import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Route, User } from 'src/generated/graphql';
import { AuthService } from 'src/app/auth/auth.service';
import { CommonModule } from '@angular/common';
import { GradeComponent } from 'src/app/shared/components/grade/grade.component';
import { InfoPropertyComponent } from 'src/app/shared/components/info-property/info-property.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { StarRatingComponent } from 'src/app/shared/components/star-rating/star-rating.component';

@Component({
  selector: 'app-route-info',
  templateUrl: './route-info.component.html',
  styleUrls: ['./route-info.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    GradeComponent,
    InfoPropertyComponent,
    MatExpansionModule,
    MatIconModule,
    StarRatingComponent,
  ],
})
export class RouteInfoComponent implements OnInit, OnDestroy {
  @Input() route: Route;
  hideGrade = false;

  eventTypeMap = {
    '1C': 'Prvi vzpon',
    '1F': 'Prva ženska ponovitev',
    '1W': 'Prva zimska ponovitev',
    '2C': 'Prva ponovitev',
    '2F': 'Prva prosta ponovitev',
    AU: 'Avtor_ica',
    BT: 'Opremil_a',
    RB: 'Preopremil_a',
  };

  user: User;
  subscriptions = [];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.hideGrade =
      this.route.properties.find(
        (property) => property.propertyType.id == 'extGrade'
      ) != null;

    const userSub = this.authService.currentUser.subscribe(
      (user) => (this.user = user)
    );
    this.subscriptions.push(userSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }
}
