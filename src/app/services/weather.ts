import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface WeatherData {
  location: { name: string; region: string; country: string; lat: number; lon: number; localtime: string; };
  current: {
    temp_c: number; temp_f: number; feelslike_c: number; feelslike_f: number;
    humidity: number; wind_kph: number; wind_mph: number; wind_dir: string;
    pressure_mb: number; vis_km: number; uv: number; is_day: number;
    condition: { text: string; icon: string; code: number; };
  };
  forecast: { forecastday: ForecastDay[]; };
}

export interface ForecastDay {
  date: string;
  day: {
    maxtemp_c: number; maxtemp_f: number; mintemp_c: number; mintemp_f: number;
    avgtemp_c: number; daily_chance_of_rain: number;
    condition: { text: string; icon: string; };
  };
  hour: HourlyData[];
}

export interface HourlyData {
  time: string; temp_c: number; temp_f: number;
  condition: { text: string; icon: string; }; chance_of_rain: number;
}

export interface SearchResult {
  id: number; name: string; region: string; country: string; lat: number; lon: number; url: string;
}

export interface SavedCity {
  name: string; region: string; country: string; query: string;
}

@Injectable({ providedIn: 'root' })
export class WeatherService {
  private http = inject(HttpClient);
  private readonly BASE_URL = 'https://api.weatherapi.com/v1';
  private apiKey = '';
  private readonly DEFAULT_API_KEY = '18ae614badbc44e1a10131039262804'; // შენი key

  setApiKey(key: string): void { 
    this.apiKey = key; 
    localStorage.setItem('weatherapi_key', key); 
  }

  getApiKey(): string {
    if (!this.apiKey) {
      this.apiKey = localStorage.getItem('weatherapi_key') || this.DEFAULT_API_KEY;
      if (this.apiKey) {
        localStorage.setItem('weatherapi_key', this.apiKey);
      }
    }
    return this.apiKey;
  }

  getForecast(query: string, days = 7): Observable<WeatherData> {
    const params = new HttpParams()
      .set('key', this.getApiKey())
      .set('q', query)
      .set('days', days)
      .set('aqi', 'no')
      .set('alerts', 'no');
    return this.http.get<WeatherData>(`${this.BASE_URL}/forecast.json`, { params });
  }

  search(query: string): Observable<SearchResult[]> {
    const params = new HttpParams().set('key', this.getApiKey()).set('q', query);
    return this.http.get<SearchResult[]>(`${this.BASE_URL}/search.json`, { params });
  }

  getSavedCities(): SavedCity[] {
    try { return JSON.parse(localStorage.getItem('saved_cities') ?? '[]') as SavedCity[]; } catch { return []; }
  }

  saveCity(city: SavedCity): void {
    const cities = this.getSavedCities();
    if (!cities.find(c => c.query === city.query)) {
      cities.push(city);
      localStorage.setItem('saved_cities', JSON.stringify(cities));
    }
  }

  removeCity(query: string): void {
    localStorage.setItem('saved_cities', JSON.stringify(this.getSavedCities().filter(c => c.query !== query)));
  }

  getUnit(): 'C' | 'F' { return (localStorage.getItem('unit') as 'C' | 'F') ?? 'C'; }
  setUnit(unit: 'C' | 'F'): void { localStorage.setItem('unit', unit); }
}