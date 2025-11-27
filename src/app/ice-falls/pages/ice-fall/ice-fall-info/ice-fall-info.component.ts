import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-ice-fall-info',
    templateUrl: './ice-fall-info.component.html',
    styleUrls: ['./ice-fall-info.component.scss'],
    standalone: false
})
export class IceFallInfoComponent{
    @Input() iceFall: any;


}
