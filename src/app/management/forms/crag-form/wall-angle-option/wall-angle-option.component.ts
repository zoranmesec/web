import { ChangeDetectionStrategy, ChangeDetectorRef, Component, input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { IconsModule } from 'src/app/shared/icons/icons.module';
import { WallAngle } from 'src/generated/graphql';
import { WallAngleData } from '../crag-form.component';

@Component({
    selector: 'app-wall-angle-option',
    imports: [IconsModule],
    templateUrl: './wall-angle-option.component.html',
    styleUrl: './wall-angle-option.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WallAngleOptionComponent implements OnInit {
    wallAngleData = input.required<WallAngleData>();
    disabled = input<boolean>(false);
    wallAngleFormControl = input.required<FormControl<WallAngle[]>>();
    protected active = false;

    constructor(private readonly changeDetectorRef: ChangeDetectorRef) {}

    ngOnInit(): void {
        this.wallAngleFormControl().valueChanges.subscribe(() => {
            this.changeDetectorRef.markForCheck();
        });
    }

    toggleActive() {
        this.active = !this.active;
    }

    protected selectWallAngle() {
        if (this.disabled()) {
            return;
        }
        const currentValues: WallAngle[] = this.wallAngleFormControl().value || [];
        if (currentValues.includes(this.wallAngleData().wallAngle)) {
            // Remove wall angle
            this.wallAngleFormControl().setValue(currentValues.filter((wa) => wa !== this.wallAngleData().wallAngle));
        } else {
            // Add wall angle
            this.wallAngleFormControl().setValue([...currentValues, this.wallAngleData().wallAngle]);
        }
    }

    get selected(): boolean {
        const currentValues: WallAngle[] = this.wallAngleFormControl().value || [];
        return currentValues.includes(this.wallAngleData().wallAngle);
    }
}
