import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class CragRoutesFiltersService {
    public static readonly MIN_GRADE = 100;
    public static readonly MAX_GRADE = 2100;
    private _minGrade = signal<number>(CragRoutesFiltersService.MIN_GRADE);
    private _maxGrade = signal<number>(CragRoutesFiltersService.MAX_GRADE);
    private _myAscents = signal<'all' | 'attempted' | 'climbed' | 'notClimbed' | 'notAttempted'>('all');

    private _starRating = signal<boolean[]>([false, false, false]);

    

    get minGrade() {
        return this._minGrade.asReadonly();
    }

    get maxGrade() {
        return this._maxGrade.asReadonly();
    }

    get starRating() {
        return this._starRating.asReadonly();
    }

    get myAscents() {
        return this._myAscents.asReadonly();
    }

    setMinGrade(grade: number) {
        this._minGrade.set(grade);
    }

    setMaxGrade(grade: number) {
        this._maxGrade.set(grade);
    }

    setStarRating(rating: boolean[]) {
        this._starRating.set(rating);
    }

    setMyAscents(filter: 'all' | 'attempted' | 'climbed' | 'notClimbed') {
        this._myAscents.set(filter);
    }

    resetAllFilters() {
        this._minGrade.set(CragRoutesFiltersService.MIN_GRADE);
        this._maxGrade.set(CragRoutesFiltersService.MAX_GRADE);
    }
}
