import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { InvestmentsService } from '../core/services/investments.service';
import { Investment, InvestmentType } from '../core/models/investment.model';
import { InvestmentDialogComponent } from './investment-dialog';

@Component({
  selector: 'app-investments',
  imports: [
    DecimalPipe,
    MatTabsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatDialogModule,
  ],
  templateUrl: './investments.html',
  styleUrl: './investments.scss',
})
export class InvestmentsComponent implements OnInit {
  private service = inject(InvestmentsService);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);

  cdtList: Investment[] = [];
  currencyList: Investment[] = [];
  loading = false;
  currentPeriod = this.getCurrentPeriod();
  selectedTabIndex = 0;

  cdtColumns = ['name', 'value', 'monthlyReturn', 'annualReturn', 'actions'];
  currencyColumns = ['name', 'value', 'valueCOP', 'exchangeRate', 'actions'];

  months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];

  get currentMonthName(): string {
    const month = parseInt(this.currentPeriod.split('-')[1], 10) - 1;
    return this.months[month];
  }

  get currentYear(): string {
    return this.currentPeriod.split('-')[0];
  }

  get cdtTotalValue(): number {
    return this.cdtList.reduce((s, i) => s + i.value, 0);
  }

  get cdtTotalMonthly(): number {
    return this.cdtList.reduce((s, i) => s + (i.monthlyReturn || 0), 0);
  }

  get cdtTotalAnnual(): number {
    return this.cdtList.reduce((s, i) => s + (i.annualReturn || 0), 0);
  }

  get currencyTotalValue(): number {
    return this.currencyList.reduce((s, i) => s + i.value, 0);
  }

  get currencyTotalCOP(): number {
    return this.currencyList.reduce((s, i) => s + (i.valueCOP || 0), 0);
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.service.getByPeriod(this.currentPeriod).subscribe({
      next: (data) => {
        this.cdtList = data.filter((i) => i.type === 'cdt');
        this.currencyList = data.filter((i) => i.type === 'currency');
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  changeMonth(delta: number) {
    const [year, month] = this.currentPeriod.split('-').map(Number);
    const date = new Date(year, month - 1 + delta, 1);
    this.currentPeriod = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    this.loadData();
  }

  openDialog(type: InvestmentType, investment?: Investment) {
    const dialogRef = this.dialog.open(InvestmentDialogComponent, {
      width: '520px',
      data: { type, investment, period: this.currentPeriod },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.loadData();
    });
  }

  deleteInvestment(investment: Investment) {
    this.service.delete(investment._id).subscribe({
      next: () => this.loadData(),
    });
  }

  private getCurrentPeriod(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
}
