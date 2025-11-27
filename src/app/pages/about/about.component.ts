import { Component, OnInit } from '@angular/core';
import { LayoutService } from 'src/app/services/layout.service';
import { MatCard } from '@angular/material/card';

@Component({
    selector: 'app-about',
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.scss'],
    imports: [MatCard]
})
export class AboutComponent implements OnInit {
    constructor(private layoutService: LayoutService) {}

    ngOnInit(): void {
        this.layoutService.$breadcrumbs.next([
            {
                name: 'O plezanje.net'
            }
        ]);
    }
}
