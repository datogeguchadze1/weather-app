import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherData } from '../../services/weather';

@Component({
  selector: 'app-current-weather',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './current-weather.html',
  styleUrl: './current-weather.scss'
})
export class CurrentWeatherComponent {
  @Input() weather!: WeatherData;
  @Input() unit: 'C' | 'F' = 'C';

  get temp() { return this.unit === 'C' ? this.weather.current.temp_c : this.weather.current.temp_f; }
  get feelsLike() { return this.unit === 'C' ? this.weather.current.feelslike_c : this.weather.current.feelslike_f; }
  get wind() { return this.unit === 'C' ? `${this.weather.current.wind_kph} კმ/სთ` : `${this.weather.current.wind_mph} მილ/სთ`; }
  get iconUrl() { return 'https:' + this.weather.current.condition.icon.replace('64x64', '128x128'); }
}
