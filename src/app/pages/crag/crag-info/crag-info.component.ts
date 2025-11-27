import { CommonModule } from '@angular/common';
import { Component, input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { MapComponent } from 'src/app/common/map/map.component';
import { BreakpointService } from 'src/app/services/breakpoint.service';
import { IconsModule } from 'src/app/shared/icons/icons.module';
import { SeasonPipe } from 'src/app/shared/pipes/season.pipe';
import { WallAnglePipe } from 'src/app/shared/pipes/wall-angle.pipe';
import { GradingSystemsService } from 'src/app/shared/services/grading-systems.service';
import { Crag, User } from 'src/generated/graphql';
import { DistributionChartComponent, IDistribution } from '../../../common/distribution-chart/distribution-chart.component';
import { CragImageComponent } from '../crag-image/crag-image.component';

interface GradeSlot {
    label: string;
    grades: string[];
    value: number;
    colorClass: string;
}

interface GradeSlots {
    gradingSystemId: string;
    regularSlots: GradeSlot[];
    compactSlots: GradeSlot[];
}

@Component({
    selector: 'app-crag-info',
    templateUrl: './crag-info.component.html',
    styleUrls: ['./crag-info.component.scss'],
    imports: [
        CommonModule,
        DistributionChartComponent,
        MatIconModule,
        MatTooltipModule,
        SeasonPipe,
        WallAnglePipe,
        CragImageComponent,
        MapComponent,
        RouterModule,
        IconsModule
    ],
    standalone: true
})
export class CragInfoComponent implements OnInit, OnChanges, OnDestroy {
    crag = input.required<Crag>();

    attendanceDistribution: IDistribution[] = [];

    crags$ = new BehaviorSubject<any>([]);
    user: User;
    subscriptions = [];

    gradeSlotsBySystem: GradeSlots[] = [
        {
            gradingSystemId: 'french',
            regularSlots: [
                {
                    label: '..4c',
                    grades: ['1', '2', '3', '4a', '4a+', '4b', '4c'],
                    value: 0,
                    colorClass: 'bg-blue-100'
                },
                {
                    label: '5a',
                    grades: ['5a', '5a+'],
                    value: 0,
                    colorClass: 'bg-neutral-300'
                },
                {
                    label: '5b',
                    grades: ['5b', '5b+'],
                    value: 0,
                    colorClass: 'bg-neutral-300'
                },
                {
                    label: '5c',
                    grades: ['5c', '5c+'],
                    value: 0,
                    colorClass: 'bg-neutral-300'
                },
                {
                    label: '6a',
                    grades: ['6a', '6a+'],
                    value: 0,
                    colorClass: 'bg-blue-300'
                },
                {
                    label: '6b',
                    grades: ['6b', '6b+'],
                    value: 0,
                    colorClass: 'bg-blue-300'
                },
                {
                    label: '6c',
                    grades: ['6c', '6c+'],
                    value: 0,
                    colorClass: 'bg-blue-300'
                },
                {
                    label: '7a',
                    grades: ['7a', '7a+'],
                    value: 0,
                    colorClass: 'bg-neutral-500'
                },
                {
                    label: '7b',
                    grades: ['7b', '7b+'],
                    value: 0,
                    colorClass: 'bg-neutral-500'
                },
                {
                    label: '7c',
                    grades: ['7c', '7c+'],
                    value: 0,
                    colorClass: 'bg-neutral-500'
                },
                {
                    label: '8a',
                    grades: ['8a', '8a+'],
                    value: 0,
                    colorClass: 'bg-blue-500'
                },
                {
                    label: '8b',
                    grades: ['8b', '8b+'],
                    value: 0,
                    colorClass: 'bg-blue-500'
                },
                {
                    label: '8c',
                    grades: ['8c', '8c+'],
                    value: 0,
                    colorClass: 'bg-blue-500'
                },
                {
                    label: '9a..',
                    grades: ['9a', '9a+', '9b', '9b+', '9c'],
                    value: 0,
                    colorClass: 'bg-neutral-700'
                }
            ],
            compactSlots: [
                {
                    label: '..5a',
                    grades: ['1', '2', '3', '4a', '4a+', '4b', '4c', '5a', '5a+'],
                    value: 0,
                    colorClass: 'bg-neutral-300'
                },
                {
                    label: '5b',
                    grades: ['5b', '5b+'],
                    value: 0,
                    colorClass: 'bg-neutral-300'
                },
                {
                    label: '5c',
                    grades: ['5c', '5c+'],
                    value: 0,
                    colorClass: 'bg-neutral-300'
                },
                {
                    label: '6a',
                    grades: ['6a', '6a+'],
                    value: 0,
                    colorClass: 'bg-blue-300'
                },
                {
                    label: '6b',
                    grades: ['6b', '6b+'],
                    value: 0,
                    colorClass: 'bg-blue-300'
                },
                {
                    label: '6c',
                    grades: ['6c', '6c+'],
                    value: 0,
                    colorClass: 'bg-blue-300'
                },
                {
                    label: '7a',
                    grades: ['7a', '7a+'],
                    value: 0,
                    colorClass: 'bg-neutral-500'
                },
                {
                    label: '7b',
                    grades: ['7b', '7b+'],
                    value: 0,
                    colorClass: 'bg-neutral-500'
                },
                {
                    label: '7c',
                    grades: ['7c', '7c+'],
                    value: 0,
                    colorClass: 'bg-neutral-500'
                },
                {
                    label: '8a',
                    grades: ['8a', '8a+'],
                    value: 0,
                    colorClass: 'bg-blue-500'
                },
                {
                    label: '8b',
                    grades: ['8b', '8b+'],
                    value: 0,
                    colorClass: 'bg-blue-500'
                },
                {
                    label: '8c..',
                    grades: ['8c', '8c+', '9a', '9a+', '9b', '9b+', '9c'],
                    value: 0,
                    colorClass: 'bg-blue-500'
                }
            ]
        },
        {
            gradingSystemId: 'uiaa',
            compactSlots: [],
            regularSlots: [
                {
                    label: '..III',
                    grades: ['I', 'II', 'III'],
                    value: 6,
                    colorClass: 'bg-blue-100'
                },
                {
                    label: 'IV',
                    grades: ['IV', 'IV+'],
                    value: 3,
                    colorClass: 'bg-neutral-300'
                },
                {
                    label: 'V',
                    grades: ['V-', 'V', 'V+'],
                    value: 4,
                    colorClass: 'bg-neutral-300'
                },
                {
                    label: 'VI',
                    grades: ['VI-', 'VI', 'VI+'],
                    value: 0,
                    colorClass: 'bg-blue-300'
                },
                {
                    label: 'VII',
                    grades: ['VII-', 'VII', 'VII+'],
                    value: 0,
                    colorClass: 'bg-blue-300'
                },
                {
                    label: 'VIII',
                    grades: ['VIII-', 'VIII', 'VIII+'],
                    value: 0,
                    colorClass: 'bg-neutral-500'
                },
                {
                    label: 'IX',
                    grades: ['IX-', 'IX', 'IX+'],
                    value: 2,
                    colorClass: 'bg-neutral-500'
                },
                {
                    label: 'X',
                    grades: ['X-', 'X', 'X+'],
                    value: 4,
                    colorClass: 'bg-blue-500'
                },
                {
                    label: 'XI',
                    grades: ['XI-', 'XI', 'XI+'],
                    value: 1,
                    colorClass: 'bg-blue-500'
                },
                {
                    label: 'XII',
                    grades: ['XII-', 'XII', 'XII+'],
                    value: 2,
                    colorClass: 'bg-neutral-700'
                }
            ]
        }
    ];
    protected gradeSlots: GradeSlots = {
        regularSlots: [],
        compactSlots: [],
        gradingSystemId: ''
    };

    get missingInfo(): string[] {
        const missing: string[] = [];
        if (!this.crag().approachTime) {
            missing.push('času dostopa');
        }
        if (!this.crag().seasons || this.crag().seasons.length === 0) {
            missing.push('sezoni');
        }
        if (!this.crag().wallAngles || this.crag().wallAngles.length === 0) {
            missing.push('naklonu sten');
        }
        if (!this.crag().rainproof) {
            missing.push('primernosti za plezanje v dežju');
        }
        if (!this.crag().orientation && this.crag().orientations && this.crag().orientations.length === 0) {
            missing.push('usmerjenosti sten');
        }
        return missing;
    }

    get needsCompactSlots(): boolean {
        return this.breakpointService.ltLg;
    }

    get routeHeight(): { minHeight: number; maxHeight: number } {
        let minHeight = 9999;
        let maxHeight = 0;
        this.crag().sectors.forEach((sector) => {
            sector.routes.forEach((route) => {
                if (route.length) {
                    if (route.length < minHeight) {
                        minHeight = route.length;
                    }
                    if (route.length > maxHeight) {
                        maxHeight = route.length;
                    }
                }
            });
        });
        return {
            minHeight: minHeight === 9999 ? 0 : minHeight,
            maxHeight: maxHeight
        };
    }

    constructor(
        private authService: AuthService,

        private gradingSystemsService: GradingSystemsService,
        protected breakpointService: BreakpointService
    ) {}

    async ngOnInit(): Promise<void> {
        // await this.init();

        const userSub = this.authService.currentUser.subscribe((user) => (this.user = user));
        this.subscriptions.push(userSub);
    }

    async ngOnChanges(): Promise<void> {
        await this.init();
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((s) => s.unsubscribe());
    }

    async init() {
        const gradingSystemId = this.crag().defaultGradingSystem?.id || 'french';
        let routes = [];
        this.crag().sectors.forEach((sector) => {
            routes = routes.concat(sector.routes);
        });

        // pick the slots that are relevant for the current crag
        const gradeSlots = this.gradeSlotsBySystem.find((gradeSlotsBy) => gradeSlotsBy.gradingSystemId === gradingSystemId);

        for (const route of routes) {
            if (route.difficulty) {
                const grade = await this.gradingSystemsService.diffToGrade(route.difficulty, gradingSystemId);

                if (grade) {
                    // fill in regular slots
                    const slot = gradeSlots?.regularSlots.find((slot) => slot.grades.includes(grade.name));
                    if (slot) {
                        slot.value++;
                    }

                    // fill in compact slots
                    if (gradeSlots?.compactSlots) {
                        const slotCompact = gradeSlots?.compactSlots.find((slot) => slot.grades.includes(grade.name));
                        if (slotCompact) {
                            slotCompact.value++;
                        }
                    }
                }
            }
        }
        this.gradeSlots = { ...gradeSlots };

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Avg', 'Sep', 'Okt', 'Nov', 'Dec'];
        this.attendanceDistribution = this.crag().activityByMonth.find((a) => a > 1)
            ? this.crag().activityByMonth.map((value, m) => ({
                  label: months[m],
                  value: value
              }))
            : [];

        this.crags$.next([this.crag()]);
    }
}
