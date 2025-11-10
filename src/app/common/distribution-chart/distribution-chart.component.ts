import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  input,
  Input,
  OnChanges,
  Output,
} from '@angular/core';
import { FlexLayoutModule } from 'ng-flex-layout';
import { BarColorPipe } from 'src/app/shared/pipes/bar-color.pipe';

// TODO move to a separate file
export interface IDistribution {
  label: string;
  value: number;
}

@Component({
  selector: 'app-distribution-chart',
  templateUrl: './distribution-chart.component.html',
  styleUrls: ['./distribution-chart.component.scss'],
  standalone: true,
  imports: [CommonModule, FlexLayoutModule, BarColorPipe],
})
export class DistributionChartComponent implements OnChanges, AfterViewInit {
  distribution = input.required<IDistribution[]>();
  direction = input<'horizontal' | 'vertical'>('horizontal');
  useGreyBackground = input<boolean>(true);
  useColorBars = input<boolean>(true);

  @Output() onViewInit = new EventEmitter<void>();

  maxValue: number;

  constructor() {}

  ngOnChanges(): void {
    if (!this.distribution()) {
      return;
    }

    let maxValue: number = 0;
    this.distribution().forEach((element) => {
      if (element.value > maxValue) {
        maxValue = element.value;
      }
    });

    this.maxValue = maxValue;
  }

  ngAfterViewInit(): void {
    // this is used when this component is a child of CragRoutePreviewComponent which measures the height after view init
    this.onViewInit.emit();
  }
}
