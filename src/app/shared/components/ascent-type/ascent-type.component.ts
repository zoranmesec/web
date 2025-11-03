import { Component, Input, OnInit } from '@angular/core';
import { Registry } from 'src/app/types/registry';
import { ASCENT_TYPES } from '../../../common/activity.constants';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from 'ng-flex-layout';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-ascent-type',
  templateUrl: './ascent-type.component.html',
  styleUrls: ['./ascent-type.component.scss'],
  imports: [CommonModule, FlexLayoutModule, MatIconModule],
  standalone: true,
})
export class AscentTypeComponent implements OnInit {
  @Input() value: string;
  @Input() displayType = 'text';
  @Input() iconAlignment = 'end';
  @Input() fixedIconsWidth = true;

  ascentType: Registry;

  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ) {
    this.matIconRegistry.addSvgIcon(
      'multipitch',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/icons/multipitch.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'toprope',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../assets/icons/toprope.svg'
      )
    );

    this.matIconRegistry.registerFontClassAlias(
      'matSymbols',
      'material-symbols'
    );
  }

  ngOnInit(): void {
    this.ascentType = ASCENT_TYPES.find((at) => at.value === this.value);
  }
}
