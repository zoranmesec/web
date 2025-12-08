import { BreakpointObserver } from '@angular/cdk/layout';
import { Injectable, OnDestroy, signal } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { CUSTOM_BREAKPOINTS } from '../shared/custom-breakpoints';

@Injectable({
    providedIn: 'root'
})
export class BreakpointService implements OnDestroy {
    private breakpoints = CUSTOM_BREAKPOINTS;
    destroyed = new Subject<void>();
    currentScreenSize: string;

    private _ltLg = signal(false);
    private _gtSm = signal(false);
    private _gtMd = signal(false);
    private _gtLg = signal(false);
    private _gtXl = signal(false);
    private _gt2Xl = signal(false);
    private _ltXl = signal(false);
    private _ltMd = signal(false);
    private _ltSm = signal(false);

    constructor(private breakpointObserver: BreakpointObserver) {
        const ltLgQuery = this.getBreakpoint('lt-lg')?.mediaQuery || '';
        this.breakpointObserver
            .observe(ltLgQuery)
            .pipe(takeUntil(this.destroyed))
            .subscribe((result) => {
                console.log(`lt-lg breakpoint matched: ${result.matches}`);
                this._ltLg.set(result.matches);
            });

        const gtSmQuery = this.getBreakpoint('gt-sm')?.mediaQuery || '';
        this.breakpointObserver
            .observe(gtSmQuery)
            .pipe(takeUntil(this.destroyed))
            .subscribe((result) => {
                console.log(`gt-sm breakpoint matched: ${result.matches}`);
                this._gtSm.set(result.matches);
            });

        const gtMdQuery = this.getBreakpoint('gt-md')?.mediaQuery || '';
        this.breakpointObserver
            .observe(gtMdQuery)
            .pipe(takeUntil(this.destroyed))
            .subscribe((result) => {
                console.log(`gt-md breakpoint matched: ${result.matches}`);
                this._gtMd.set(result.matches);
            });
        const gtLgQuery = this.getBreakpoint('gt-lg')?.mediaQuery || '';
        this.breakpointObserver
            .observe(gtLgQuery)
            .pipe(takeUntil(this.destroyed))
            .subscribe((result) => {
                console.log(`gt-lg breakpoint matched: ${result.matches}`);
                this._gtLg.set(result.matches);
            });

        const gtXlQuery = this.getBreakpoint('gt-xl')?.mediaQuery || '';
        this.breakpointObserver
            .observe(gtXlQuery)
            .pipe(takeUntil(this.destroyed))
            .subscribe((result) => {
                console.log(`gt-xl breakpoint matched: ${result.matches}`);
                this._gtXl.set(result.matches);
            });

        const gt2XlQuery = this.getBreakpoint('gt-2xl')?.mediaQuery || '';
        this.breakpointObserver
            .observe(gt2XlQuery)
            .pipe(takeUntil(this.destroyed))
            .subscribe((result) => {
                console.log(`gt-2xl breakpoint matched: ${result.matches}`);
                this._gt2Xl.set(result.matches);
            });

        const ltXlQuery = this.getBreakpoint('lt-xl')?.mediaQuery || '';
        this.breakpointObserver
            .observe(ltXlQuery)
            .pipe(takeUntil(this.destroyed))
            .subscribe((result) => {
                console.log(`lt-xl breakpoint matched: ${result.matches}`);
                this._ltXl.set(result.matches);
            });

        const ltMdQuery = this.getBreakpoint('lt-md')?.mediaQuery || '';
        this.breakpointObserver
            .observe(ltMdQuery)
            .pipe(takeUntil(this.destroyed))
            .subscribe((result) => {
                console.log(`lt-md breakpoint matched: ${result.matches}`);
                this._ltMd.set(result.matches);
            });

        const ltSmQuery = this.getBreakpoint('lt-sm')?.mediaQuery || '';
        this.breakpointObserver
            .observe(ltSmQuery)
            .pipe(takeUntil(this.destroyed))
            .subscribe((result) => {
                console.log(`lt-sm breakpoint matched: ${result.matches}`);
                this._ltSm.set(result.matches);
            });

        // this.observe()
        //     .pipe(takeUntil(this.destroyed))
        //     .subscribe((result) => {
        //         console.log('Breakpoint changes detected:', result);
        //         for (const query of Object.keys(result.breakpoints)) {
        //             if (result.breakpoints[query]) {
        //                 console.log(`Matched breakpoint: ${query}`);
        //             }
        //         }
        //     });
    }

    get sgLtLg() {
        return this._ltLg.asReadonly();
    }

    get sgGtSm() {
        return this._gtSm.asReadonly();
    }

    get sgGtMd() {
        return this._gtMd.asReadonly();
    }

    get sgGtLg() {
        return this._gtLg.asReadonly();
    }

    get sgGtXl() {
        return this._gtXl.asReadonly();
    }

    get sgGt2Xl() {
        return this._gt2Xl.asReadonly();
    }

    get sgLtXl() {
        return this._ltXl.asReadonly();
    }

    get sgLtMd() {
        return this._ltMd.asReadonly();
    }

    get sgLtSm() {
        return this._ltSm.asReadonly();
    }

    private getBreakpoint(alias: string) {
        return this.breakpoints.find((bp) => bp.alias === alias);
    }

    public observe() {
        const queries = this.breakpoints.map((bp) => bp.mediaQuery);
        return this.breakpointObserver.observe(queries);
    }

    ngOnDestroy() {
        this.destroyed.next();
        this.destroyed.complete();
    }
}
