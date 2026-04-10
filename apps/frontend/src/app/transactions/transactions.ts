import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { TransactionsService } from '../core/services/transactions.service';
import {
  Transaction,
  TransactionSummary,
  TransactionType,
} from '../core/models/transaction.model';
import { TransactionDialogComponent } from './transaction-dialog';

@Component({
  selector: 'app-transactions',
  imports: [
    ReactiveFormsModule,
    DatePipe,
    DecimalPipe,
    MatTabsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatMenuModule,
  ],
  templateUrl: './transactions.html',
  styleUrl: './transactions.scss',
})
export class TransactionsComponent implements OnInit {
  private transactionsService = inject(TransactionsService);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);

  incomeList: Transaction[] = [];
  expenseList: Transaction[] = [];
  summary: TransactionSummary | null = null;
  loading = false;
  currentPeriod = this.getCurrentPeriod();
  selectedTabIndex = 0;

  incomeColumns = ['source', 'amount', 'isRecurring', 'isPaid', 'dueDate', 'actions'];
  expenseColumns = ['source', 'amount', 'isRecurring', 'isPaid', 'dueDate', 'actions'];

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

  get incomeTotalPaid(): number {
    return this.incomeList.filter((t) => t.isPaid).reduce((s, t) => s + t.amount, 0);
  }

  get incomeTotalPending(): number {
    return this.incomeList.filter((t) => !t.isPaid).reduce((s, t) => s + t.amount, 0);
  }

  get incomeTotal(): number {
    return this.incomeList.reduce((s, t) => s + t.amount, 0);
  }

  get expenseTotalPaid(): number {
    return this.expenseList.filter((t) => t.isPaid).reduce((s, t) => s + t.amount, 0);
  }

  get expenseTotalPending(): number {
    return this.expenseList.filter((t) => !t.isPaid).reduce((s, t) => s + t.amount, 0);
  }

  get expenseTotal(): number {
    return this.expenseList.reduce((s, t) => s + t.amount, 0);
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    const period = this.currentPeriod;

    // Auto-generate recurring transactions for this period, then load data
    this.transactionsService.generateRecurring(period).subscribe({
      next: () => this.fetchTransactions(period),
      error: () => this.fetchTransactions(period),
    });
  }

  private fetchTransactions(period: string) {
    this.transactionsService.getByPeriod(period).subscribe({
      next: (transactions) => {
        this.incomeList = transactions.filter((t) => t.type === 'income');
        this.expenseList = transactions.filter((t) => t.type === 'expense');
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });

    this.transactionsService.getSummary(period).subscribe({
      next: (summary) => {
        this.summary = summary;
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

  openDialog(type: TransactionType, transaction?: Transaction) {
    const dialogRef = this.dialog.open(TransactionDialogComponent, {
      width: '480px',
      data: { type, transaction, period: this.currentPeriod },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.loadData();
    });
  }

  togglePaid(transaction: Transaction) {
    this.transactionsService.togglePaid(transaction._id).subscribe({
      next: () => this.loadData(),
    });
  }

  deleteTransaction(transaction: Transaction) {
    this.transactionsService.delete(transaction._id).subscribe({
      next: () => this.loadData(),
    });
  }

  private getCurrentPeriod(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
}
