import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { WeatherService, WeatherData } from '../../services/weather';
import { SearchComponent } from '../search/search';
import { CurrentWeatherComponent } from '../current-weather/current-weather';
import { ForecastCardComponent } from '../forecast-card/forecast-card';
import { HourlyChartComponent } from '../hourly-chart/hourly-chart';
import { SavedCitiesComponent } from '../saved-cities/saved-cities';

@Component({
  selector: 'app-weather-dashboard',
  standalone: true,
  imports: [CommonModule, SearchComponent, CurrentWeatherComponent, ForecastCardComponent, HourlyChartComponent, SavedCitiesComponent],
  templateUrl: './weather-dashboard.html',
  styleUrl: './weather-dashboard.scss'
})
export class WeatherDashboard implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private weatherService = inject(WeatherService);

  weather = signal<WeatherData | null>(null);
  loading = signal(false);
  error = signal('');
  unit = signal<'C' | 'F'>('C');
  showApiKeyInput = signal(false);
  apiKeyInput = signal('');

  ngOnInit(): void {
    this.unit.set(this.weatherService.getUnit());
    if (!this.weatherService.getApiKey()) {
      this.showApiKeyInput.set(true);
      return;
    }
    const query = this.route.snapshot.paramMap.get('query');
    this.load(query ?? 'Tbilisi');
  }

  onApiKeyInput(event: Event): void {
    this.apiKeyInput.set((event.target as HTMLInputElement).value);
  }

  load(query: string): void {
    this.loading.set(true);
    this.error.set('');
    this.weatherService.getForecast(query).subscribe({
      next: (data: WeatherData) => {
        this.weather.set(data);
        this.loading.set(false);
      },
      error: (err: { error?: { error?: { message?: string } } }) => {
        this.error.set(err?.error?.error?.message ?? 'ქალაქი ვერ მოიძებნა');
        this.loading.set(false);
      }
    });
  }

  onCitySelect(query: string): void {
    void this.router.navigate(['/city', query]);
    this.load(query);
  }

  onUseLocation(): void {
    navigator.geolocation.getCurrentPosition(
      pos => this.load(`${pos.coords.latitude},${pos.coords.longitude}`),
      () => this.error.set('მდებარეობა ვერ მოიძებნა')
    );
  }

  onSaveCity(): void {
    const w = this.weather();
    if (!w) return;
    this.weatherService.saveCity({
      name: w.location.name,
      region: w.location.region,
      country: w.location.country,
      query: w.location.name
    });
  }

  toggleUnit(): void {
    const u = this.unit() === 'C' ? 'F' : 'C';
    this.unit.set(u);
    this.weatherService.setUnit(u);
  }

  saveApiKey(): void {
    const key = this.apiKeyInput().trim();
    if (!key) return;
    this.weatherService.setApiKey(key);
    this.showApiKeyInput.set(false);
    this.load('Tbilisi');
  }

  get bgGradient(): string {
    const w = this.weather();
    if (!w) return 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)';
    const code = w.current.condition.code;
    const isDay = w.current.is_day;
    if (!isDay) return 'linear-gradient(135deg, #0d1117, #1a1a2e, #16213e)';
    if (code === 1000) return 'linear-gradient(135deg, #1a6b8a, #2196f3, #f59e0b)';
    if ([1003, 1006, 1009].includes(code)) return 'linear-gradient(135deg, #374151, #4b5563, #6b7280)';
    if (code >= 1180 && code <= 1201) return 'linear-gradient(135deg, #1e3a5f, #2c5282, #4a5568)';
    return 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)';
  }
}
