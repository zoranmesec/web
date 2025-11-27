import { Component, OnInit } from '@angular/core';
import { LayoutService } from 'src/app/services/layout.service';
import { MatCard } from '@angular/material/card';

@Component({
    selector: 'app-how-to-contribute',
    templateUrl: './how-to-contribute.component.html',
    styleUrls: ['./how-to-contribute.component.scss'],
    imports: [MatCard]
})
export class HowToContributeComponent implements OnInit {
    constructor(private layoutService: LayoutService) {}

    ngOnInit(): void {
        this.layoutService.$breadcrumbs.next([
            {
                name: 'Navodila'
            },
            {
                name: 'Dodajanje prispevkov'
            }
        ]);
    }
}
