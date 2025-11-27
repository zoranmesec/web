import { Component, OnInit } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { LayoutService } from 'src/app/services/layout.service';

@Component({
    selector: 'app-changelog',
    templateUrl: './changelog.component.html',
    styleUrls: ['./changelog.component.scss'],
    imports: [MatCard, MatIcon, RouterLink]
})
export class ChangelogComponent implements OnInit {
    constructor(private layoutService: LayoutService) {}

    ngOnInit(): void {
        this.layoutService.$breadcrumbs.next([
            {
                name: 'Dnevnik sprememb'
            }
        ]);
    }
}
