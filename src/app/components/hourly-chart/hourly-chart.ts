import { Component, Input, OnChanges, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HourlyData } from '../../services/weather';

@Component({
  selector: 'app-hourly-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hourly-chart.html',
  styleUrl: './hourly-chart.scss'
})
export class HourlyChartComponent implements OnChanges, AfterViewInit {
  @Input() hours!: HourlyData[];
  @Input() unit: 'C' | 'F' = 'C';
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private drawn = false;

  ngAfterViewInit() { this.drawn = true; this.draw(); }
  ngOnChanges() { if (this.drawn) this.draw(); }

  get next24() { return this.hours.slice(0, 24); }

  getTemp(h: HourlyData) { return this.unit === 'C' ? h.temp_c : h.temp_f; }
  getHour(h: HourlyData) { return new Date(h.time).getHours(); }

  draw() {
    if (!this.canvasRef) return;
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const hours = this.next24;
    const temps = hours.map(h => this.getTemp(h));
    const min = Math.min(...temps) - 2;
    const max = Math.max(...temps) + 2;
    const W = canvas.width, H = canvas.height;
    const pad = { t: 20, b: 30, l: 10, r: 10 };

    ctx.clearRect(0, 0, W, H);

    const x = (i: number) => pad.l + (i / (hours.length - 1)) * (W - pad.l - pad.r);
    const y = (t: number) => pad.t + (1 - (t - min) / (max - min)) * (H - pad.t - pad.b);

    // gradient fill
    const grad = ctx.createLinearGradient(0, pad.t, 0, H - pad.b);
    grad.addColorStop(0, 'rgba(255,255,255,0.3)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.beginPath();
    ctx.moveTo(x(0), y(temps[0]));
    for (let i = 1; i < temps.length; i++) ctx.lineTo(x(i), y(temps[i]));
    ctx.lineTo(x(temps.length - 1), H - pad.b);
    ctx.lineTo(x(0), H - pad.b);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // line
    ctx.beginPath();
    ctx.moveTo(x(0), y(temps[0]));
    for (let i = 1; i < temps.length; i++) ctx.lineTo(x(i), y(temps[i]));
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // labels every 4h
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '10px system-ui';
    ctx.textAlign = 'center';
    for (let i = 0; i < hours.length; i += 4) {
      const h = this.getHour(hours[i]);
      ctx.fillText(`${h}:00`, x(i), H - 8);
      ctx.fillText(`${Math.round(temps[i])}°`, x(i), y(temps[i]) - 6);
    }
  }
}
