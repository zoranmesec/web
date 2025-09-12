import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  input,
  OnInit,
} from '@angular/core';
import { ResponsiveImageComponent } from 'src/app/shared/components/responsive-image/responsive-image.component';
import { environment } from 'src/environments/environment';
import { Crag } from 'src/generated/graphql';

@Component({
  selector: 'app-crag-image',
  templateUrl: './crag-image.component.html',
  styleUrls: ['./crag-image.component.scss'],
  imports: [ResponsiveImageComponent],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CragImageComponent implements OnInit {
  crag = input.required<Crag>();

  storageUrl = environment.storageUrl;

  constructor() {}

  ngOnInit(): void {}
}
