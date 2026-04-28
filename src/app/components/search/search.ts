import { Component, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherService, SearchResult } from '../../services/weather';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './search.html',
  styleUrl: './search.scss'
})
export class SearchComponent {
  private weatherService = inject(WeatherService);
  @Output() citySelected = new EventEmitter<string>();
  @Output() useLocation = new EventEmitter<void>();

  query = signal('');
  results = signal<SearchResult[]>([]);
  showDropdown = signal(false);

  private search$ = new Subject<string>();

  constructor() {
    this.search$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((q: string) => q.length > 1 ? this.weatherService.search(q) : of([] as SearchResult[]))
    ).subscribe((results: SearchResult[]) => {
      this.results.set(results);
      this.showDropdown.set(results.length > 0);
    });
  }

  onInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.query.set(val);
    this.search$.next(val);
  }

  onBlur(): void {
    setTimeout(() => this.showDropdown.set(false), 150);
  }

  select(r: SearchResult): void {
    this.query.set(r.name);
    this.showDropdown.set(false);
    this.citySelected.emit(r.name);
  }

  submit(): void {
    if (this.query()) {
      this.showDropdown.set(false);
      this.citySelected.emit(this.query());
    }
  }
}
