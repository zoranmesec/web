import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, input, OnInit } from '@angular/core';
import { FormControl, FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { GradeComponent } from 'src/app/shared/components/grade/grade.component';
import { IconsModule } from 'src/app/shared/icons/icons.module';
import { Route } from 'src/generated/graphql';

@Component({
    selector: 'app-route-container',
    imports: [GradeComponent, IconsModule, MatCheckboxModule, FormsModule],
    templateUrl: './route-container.component.html',
    styleUrl: './route-container.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RouteContainerComponent implements OnInit {
    route = input.required<Route>();
    routeFormControl = input.required<FormControl<string[]>>();

    private readonly cdr = inject(ChangeDetectorRef);
    private checked = false;

    ngOnInit() {
        this.routeFormControl().valueChanges.subscribe((value) => {
            if (value) {
                this.checked = value.includes(this.route().id);
            } else {
                this.checked = false;
            }
            this.cdr.markForCheck();
        });
    }

    protected onChange() {
        const selectedRouteIds: string[] = this.routeFormControl().value || [];
        if (selectedRouteIds.includes(this.route().id)) {
            // Remove route id
            this.routeFormControl().setValue(selectedRouteIds.filter((id) => id !== this.route().id));
        } else {
            // Add route id
            this.routeFormControl().setValue([...selectedRouteIds, this.route().id]);
        }

        console.log('Selected route IDs:', this.routeFormControl().value);
    }

    get isChecked(): boolean {
        return this.checked;
    }

    get isDisabled(): boolean {
        return this.route().publishStatus === 'in_review';
    }
}
