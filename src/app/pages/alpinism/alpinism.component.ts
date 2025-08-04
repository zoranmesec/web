import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LayoutService } from 'src/app/services/layout.service';

@Component({
  selector: 'app-alpinism',
  templateUrl: './alpinism.component.html',
  styleUrls: ['./alpinism.component.scss'],
  standalone: true,
  imports: [RouterLink],
})
export class AlpinismComponent implements OnInit {
  constructor(private layoutService: LayoutService) {}

  ngOnInit(): void {
    this.layoutService.$breadcrumbs.next([
      {
        name: 'Alpinizem',
      },
    ]);
  }
}
