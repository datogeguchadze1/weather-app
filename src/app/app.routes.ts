import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./components/weather-dashboard/weather-dashboard').then(m => m.WeatherDashboard) },
  { path: 'city/:query', loadComponent: () => import('./components/weather-dashboard/weather-dashboard').then(m => m.WeatherDashboard) },
];
