import { BreakpointObserver } from '@angular/cdk/layout';
import { Injectable } from '@angular/core';
import { CUSTOM_BREAKPOINTS } from '../shared/custom-breakpoints';

@Injectable({
    providedIn: 'root'
})
export class BreakpointService {
    private breakpoints = CUSTOM_BREAKPOINTS;
    constructor(private breakpointObserver: BreakpointObserver) {}

    get gtSm() {
        const breakpoint = this.getBreakpoint('gt-sm');
        return this.breakpointObserver.isMatched(breakpoint.mediaQuery);
    }

    get gtMd() {
        const breakpoint = this.getBreakpoint('gt-md');
        return this.breakpointObserver.isMatched(breakpoint.mediaQuery);
    }

    get gtLg() {
        const breakpoint = this.getBreakpoint('gt-lg');
        return this.breakpointObserver.isMatched(breakpoint.mediaQuery);
    }

    get gtXl() {
        const breakpoint = this.getBreakpoint('gt-xl');
        return this.breakpointObserver.isMatched(breakpoint.mediaQuery);
    }

    get gt2Xl() {
        const breakpoint = this.getBreakpoint('gt-2xl');
        return this.breakpointObserver.isMatched(breakpoint.mediaQuery);
    }

    get ltXl() {
        const breakpoint = this.getBreakpoint('lt-xl');
        return this.breakpointObserver.isMatched(breakpoint.mediaQuery);
    }

    get ltLg() {
        const breakpoint = this.getBreakpoint('lt-lg');
        return this.breakpointObserver.isMatched(breakpoint.mediaQuery);
    }
    get ltMd() {
        const breakpoint = this.getBreakpoint('lt-md');
        return this.breakpointObserver.isMatched(breakpoint.mediaQuery);
    }

    get ltSm() {
        const breakpoint = this.getBreakpoint('lt-sm');
        return this.breakpointObserver.isMatched(breakpoint.mediaQuery);
    }

    private getBreakpoint(alias: string) {
        return this.breakpoints.find((bp) => bp.alias === alias);
    }

    public observe() {
        const queries = this.breakpoints.map((bp) => bp.mediaQuery);
        return this.breakpointObserver.observe(queries);
    }
}
