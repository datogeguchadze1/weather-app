import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ForecastDay } from '../../services/weather';

@Component({
  selector: 'app-forecast-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './forecast-card.html',
  styleUrl: './forecast-card.scss'
})
export class ForecastCardComponent {
  @Input() day!: ForecastDay;
  @Input() unit: 'C' | 'F' = 'C';

  get dayName() {
    const d = new Date(this.day.date);
    return d.toLocaleDateString('ka-GE', { weekday: 'short' });
  }
  get max() { return this.unit === 'C' ? this.day.day.maxtemp_c : this.day.day.maxtemp_f; }
  get min() { return this.unit === 'C' ? this.day.day.mintemp_c : this.day.day.mintemp_f; }
  get iconUrl() { return 'https:' + this.day.day.condition.icon; }
}
