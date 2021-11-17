import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DataError } from 'src/app/types/data-error';
import { PopularCragsGQL, PopularCragsQuery } from 'src/generated/graphql';

@Component({
  selector: 'app-popular-crags-card',
  templateUrl: './popular-crags-card.component.html',
  styleUrls: ['./popular-crags-card.component.scss'],
})
export class PopularCragsCardComponent implements OnInit {
  constructor(private popularCragsGQL: PopularCragsGQL) {}

  loading = true;

  popularCrags: PopularCragsQuery['popularCrags'];
  expand = false;

  @Input() dateFrom: string;
  @Input() top: number;
  @Input() title: string;

  @Output() errorEvent = new EventEmitter<DataError>();

  ngOnInit(): void {
    this.popularCragsGQL
      .fetch({
        dateFrom: this.dateFrom,
        top: this.top,
      })
      .toPromise()
      .then((result) => {
        this.loading = false;
        if (result.errors != null) {
          this.errorEvent.emit({
            message: 'Prišlo je do nepričakovane napake pri zajemu podatkov.',
          });
        } else {
          this.popularCrags = result.data.popularCrags;
        }
      });
  }
}
