import { Component, Output, EventEmitter, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherService, SavedCity } from '../../services/weather';

@Component({
  selector: 'app-saved-cities',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './saved-cities.html',
  styleUrl: './saved-cities.scss'
})
export class SavedCitiesComponent implements OnInit {
  private weatherService = inject(WeatherService);
  @Output() citySelected = new EventEmitter<string>();

  cities = signal<SavedCity[]>([]);

  ngOnInit() { this.cities.set(this.weatherService.getSavedCities()); }

  remove(query: string, e: Event) {
    e.stopPropagation();
    this.weatherService.removeCity(query);
    this.cities.set(this.weatherService.getSavedCities());
  }

  select(query: string) { this.citySelected.emit(query); }
}
