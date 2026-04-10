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
import { DebtsService } from '../core/services/debts.service';
import { Debt, DebtType } from '../core/models/debt.model';
import { DebtDialogComponent } from './debt-dialog';

@Component({
  selector: 'app-debts',
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
  templateUrl: './debts.html',
  styleUrl: './debts.scss',
})
export class DebtsComponent implements OnInit {
  private service = inject(DebtsService);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);

  debtorList: Debt[] = [];
  creditorList: Debt[] = [];
  loading = false;
  currentPeriod = this.getCurrentPeriod();
  selectedTabIndex = 0;
  displayedColumns = ['name', 'amount', 'description', 'actions'];

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

  get debtorTotal(): number {
    return this.debtorList.reduce((s, d) => s + d.amount, 0);
  }

  get creditorTotal(): number {
    return this.creditorList.reduce((s, d) => s + d.amount, 0);
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.service.getByPeriod(this.currentPeriod).subscribe({
      next: (data) => {
        this.debtorList = data.filter((d) => d.type === 'debtor');
        this.creditorList = data.filter((d) => d.type === 'creditor');
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

  openDialog(type: DebtType, debt?: Debt) {
    const dialogRef = this.dialog.open(DebtDialogComponent, {
      width: '480px',
      data: { type, debt, period: this.currentPeriod },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.loadData();
    });
  }

  deleteDebt(debt: Debt) {
    this.service.delete(debt._id).subscribe({
      next: () => this.loadData(),
    });
  }

  private getCurrentPeriod(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
}
