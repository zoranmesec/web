import { Injectable } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { CUSTOM_BREAKPOINTS } from '../shared/custom-breakpoints';

@Injectable({
  providedIn: 'root',
})
export class BreakpointService {
  private breakpoints = CUSTOM_BREAKPOINTS;
  constructor(private breakpointObserver: BreakpointObserver) {}

  public gtSm() {
    const breakpoint = this.getBreakpoint('gt-sm');
    return this.breakpointObserver.isMatched(breakpoint.mediaQuery);
  }

  public gtMd() {
    const breakpoint = this.getBreakpoint('gt-md');
    return this.breakpointObserver.isMatched(breakpoint.mediaQuery);
  }

  public gtLg() {
    const breakpoint = this.getBreakpoint('gt-lg');
    return this.breakpointObserver.isMatched(breakpoint.mediaQuery);
  }

  public gtXl() {
    const breakpoint = this.getBreakpoint('gt-xl');
    return this.breakpointObserver.isMatched(breakpoint.mediaQuery);
  }

  public gt2Xl() {
    const breakpoint = this.getBreakpoint('gt-2xl');
    return this.breakpointObserver.isMatched(breakpoint.mediaQuery);
  }

  public ltXl() {
    const breakpoint = this.getBreakpoint('lt-xl');
    return this.breakpointObserver.isMatched(breakpoint.mediaQuery);
  }

  public ltLg() {
    const breakpoint = this.getBreakpoint('lt-lg');
    return this.breakpointObserver.isMatched(breakpoint.mediaQuery);
  }
  public ltMd() {
    const breakpoint = this.getBreakpoint('lt-md');
    return this.breakpointObserver.isMatched(breakpoint.mediaQuery);
  }

  public ltSm() {
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
