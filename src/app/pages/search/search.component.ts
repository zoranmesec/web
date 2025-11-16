import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  OnChanges,
  OnDestroy,
  OnInit,
  output,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatAutocompleteTrigger,
  MatAutocompleteModule,
} from '@angular/material/autocomplete';
import { ActivatedRoute, Router } from '@angular/router';
import { EMPTY, Subscription } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  switchMap,
} from 'rxjs/operators';
import {
  Comment,
  Crag,
  Route,
  SearchAutoCompleteCragsGQL,
  SearchAutoCompleteGQL,
  SearchAutoCompleteRoutesGQL,
  SearchResults,
  Sector,
  User,
} from 'src/generated/graphql';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FlexLayoutModule } from 'ng-flex-layout';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { LoaderComponent } from 'src/app/shared/components/loader/loader.component';

export enum SearchType {
  Crag = 'crag',
  Route = 'route',
  Sector = 'sector',
  Comment = 'comment',
  All = 'all',
}
@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  imports: [
    CommonModule,
    MatIconModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatButtonModule,
    LoaderComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchComponent implements OnDestroy, OnChanges {
  searchType = input<SearchType>(SearchType.All);
  forCrag = input<Crag | null>();
  forRoute = input<Route | null>();
  disabled = input<boolean>(false);
  onSelected = output<Route | User | Crag | Sector | Comment>();

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private searchAutoCompleteGQL: SearchAutoCompleteGQL,
    private searchAutoCompleteCragsGQL: SearchAutoCompleteCragsGQL,
    private searchAutoCompleteRoutesGQL: SearchAutoCompleteRoutesGQL,
    private fb: FormBuilder
  ) {}

  searchForm = this.fb.group({
    searchControl: this.fb.control('', {
      validators: [],
    }),
  });
  @ViewChild(MatAutocompleteTrigger)
  autocompleteTrigger: MatAutocompleteTrigger;

  @ViewChild('searchInput') searchInput: ElementRef<HTMLInputElement>;

  searchString = '';
  searchResults: SearchResults;
  error = false;

  subscription: Subscription;

  ngOnChanges(): void {
    // this.activatedRoute.params.subscribe((params) => {
    //   this.searchForm.controls.searchControl.setValue(params.search);
    // });

    if (this.disabled()) {
      // disable the form
      this.searchForm.disable();
      return;
    } else {
      // enable the form
      this.searchForm.enable();
    }

    if (
      this.forCrag() !== undefined &&
      this.forCrag() !== null &&
      this.searchType() !== SearchType.Route
    ) {
      this.searchForm.get('searchControl').setValue(this.forCrag().name);
    }

    if (this.forRoute() !== undefined && this.forRoute() !== null) {
      this.searchForm.get('searchControl').setValue(this.forRoute().name);
    }

    this.subscription = this.searchForm.controls.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        filter((value) => {
          return value && value.length >= 3;
        }),
        distinctUntilChanged(),
        switchMap((searchString: string) => {
          this.searchString = searchString;
          this.error = false;
          if (this.searchType() === SearchType.Crag) {
            return this.searchAutoCompleteCragsGQL
              .fetch({
                searchInput: { searchString },
              })
              .pipe(
                catchError(() => {
                  this.error = true;
                  return EMPTY;
                })
              );
          } else if (this.searchType() === SearchType.Route) {
            return this.searchAutoCompleteRoutesGQL
              .fetch({
                searchInput: { searchString, cragId: this.forCrag()?.id },
              })
              .pipe(
                catchError(() => {
                  this.error = true;
                  return EMPTY;
                })
              );
          } else {
            return this.searchAutoCompleteGQL
              .fetch({
                searchInput: { searchString },
              })
              .pipe(
                catchError(() => {
                  this.error = true;
                  return EMPTY;
                })
              );
          }
        })
      )
      .subscribe({
        next: (result) => {
          this.searchResults = <SearchResults>result.data.searchByInput;
          this.autocompleteTrigger.openPanel();
          this.searchInput.nativeElement.focus();
        },
      });
  }

  get typeLabel(): string {
    switch (this.searchType()) {
      case SearchType.Crag:
        return 'Plezališče';
      case SearchType.Route:
        return 'Smer';
      case SearchType.Sector:
        return 'Sektor';
      case SearchType.Comment:
        return 'Komentar';
      default:
        return 'Iskanje';
    }
  }

  onSubmit() {
    this.autocompleteTrigger.openPanel();
    this.searchInput.nativeElement.focus();
    // this.router.navigate([
    //   '/iskanje',
    //   this.searchForm.controls.searchControl.value,
    // ]);
  }

  onClear() {
    this.searchForm.controls.searchControl.setValue('');
    this.onSelected.emit(null);
  }

  // should never come to this, because onOptionSelected is triggered and user is redirected before this happens
  // using fatarrow to get the correct 'this' reference
  displayFn = (optionValue: Crag | Route | Sector | User | Comment) => {
    // on load -> value is undefined or is a string from the input
    if (!optionValue || !optionValue.__typename) {
      return this.searchForm.controls.searchControl.value;
    }

    switch (optionValue.__typename) {
      case 'Crag':
      case 'Route':
      case 'Sector':
        return optionValue.name;
      case 'User':
        return optionValue.fullName;
      default:
        return this.searchForm.controls.searchControl.value; // just keep what is already typed in the input
    }
  };

  // when an option is selected from the dropdown, navigate to the corresponding entity
  onOptionSelected(optionValue: Route | User | Crag | Sector | Comment) {
    switch (optionValue.__typename) {
      case 'Crag':
        const crag = optionValue;

        if (this.onSelected) {
          this.onSelected.emit(crag);
          return;
        }
        this.router.navigate(
          crag.type == 'alpine'
            ? ['/alpinizem/stena', crag.slug]
            : ['/plezalisce', crag.slug]
        );

        break;

      case 'Route':
        const route = optionValue;
        if (this.onSelected) {
          this.onSelected.emit(route);
          return;
        }
        this.router.navigate(
          route.crag.type == 'alpine'
            ? ['/alpinizem/stena', route.crag.slug, 'smer', route.slug]
            : ['/plezalisce', route.crag.slug, 'smer', route.slug]
        );
        break;

      case 'Sector':
        const sector = optionValue;

        if (this.onSelected) {
          this.onSelected.emit(sector);
          return;
        }
        this.router.navigate(
          sector.crag.type == 'alpine'
            ? ['/alpinizem/stena', sector.crag.slug]
            : ['/plezalisce', sector.crag.slug]
        );
        break;

      // not used until we implement user profile pages
      // case 'User':
      //   const user = optionValue;
      //   this.router.navigate(['/uporabniki', user.fullName]);
      //   break;
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
