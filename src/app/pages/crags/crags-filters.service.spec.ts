import { TestBed } from '@angular/core/testing';

import { CragsFiltersService } from './crags-filters.service';

describe('CragsFiltersService', () => {
    let service: CragsFiltersService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(CragsFiltersService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
