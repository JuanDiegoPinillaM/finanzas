import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-period-selector',
  imports: [MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './period-selector.html',
  styleUrl: './period-selector.scss',
})
export class PeriodSelectorComponent {
  @Input() period = '';
  @Output() periodChange = new EventEmitter<string>();

  months = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
  ];

  monthsFull = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];

  get currentYear(): number {
    return parseInt(this.period.split('-')[0], 10);
  }

  get currentMonth(): number {
    return parseInt(this.period.split('-')[1], 10);
  }

  get currentMonthName(): string {
    return this.monthsFull[this.currentMonth - 1];
  }

  get isCurrentPeriod(): boolean {
    return this.period === this.getTodayPeriod();
  }

  changeYear(delta: number) {
    this.emit(this.currentYear + delta, this.currentMonth);
  }

  changeMonth(delta: number) {
    const date = new Date(this.currentYear, this.currentMonth - 1 + delta, 1);
    this.emit(date.getFullYear(), date.getMonth() + 1);
  }

  selectMonth(monthIndex: number) {
    this.emit(this.currentYear, monthIndex + 1);
  }

  goToToday() {
    const now = new Date();
    this.emit(now.getFullYear(), now.getMonth() + 1);
  }

  private emit(year: number, month: number) {
    const period = `${year}-${String(month).padStart(2, '0')}`;
    this.period = period;
    this.periodChange.emit(period);
  }

  private getTodayPeriod(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
}
