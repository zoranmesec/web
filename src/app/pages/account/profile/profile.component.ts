import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { LayoutService } from 'src/app/services/layout.service';
import { MatIcon } from '@angular/material/icon';
import { MatCard, MatCardContent } from '@angular/material/card';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss'],
    imports: [MatIcon, MatCard, MatCardContent, RouterLink]
})
export class ProfileComponent implements OnInit {
    constructor(
        private layoutService: LayoutService,
        private authService: AuthService,
        private snackbar: MatSnackBar,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.layoutService.$breadcrumbs.next([
            {
                name: 'Moj profil'
            }
        ]);
    }

    logout() {
        this.authService.logout().then(() => {
            this.router.navigate(['/']);

            this.snackbar.open('Uspešno ste se odjavili', null, { duration: 3000 });
        });
    }
}
