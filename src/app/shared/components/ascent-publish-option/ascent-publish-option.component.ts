import { ChangeDetectionStrategy, Component, input, OnChanges, OnInit } from '@angular/core';
import { Registry } from 'src/app/types/registry';
import { PUBLISH_OPTIONS } from '../../../common/activity.constants';

@Component({
    selector: 'app-ascent-publish-option',
    templateUrl: './ascent-publish-option.component.html',
    styleUrls: ['./ascent-publish-option.component.scss'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AscentPublishOptionComponent implements OnInit, OnChanges {
    value = input.required<string>();

    publishOption: Registry;

    

    ngOnInit(): void {
        this.publishOption = PUBLISH_OPTIONS.find((at) => at.value === this.value());
    }

    ngOnChanges(changes): void {
        if (changes.value) {
            console.log('AscentPublishOptionComponent value changed:', this.value(), changes.value);
            this.publishOption = PUBLISH_OPTIONS.find((at) => at.value === this.value());
        }
    }
}
