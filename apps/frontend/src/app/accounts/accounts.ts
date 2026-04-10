import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { AccountsService } from '../core/services/accounts.service';
import { Account } from '../core/models/account.model';
import { AccountDialogComponent } from './account-dialog';

@Component({
  selector: 'app-accounts',
  imports: [
    DecimalPipe,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatDialogModule,
  ],
  templateUrl: './accounts.html',
  styleUrl: './accounts.scss',
})
export class AccountsComponent implements OnInit {
  private service = inject(AccountsService);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);

  accounts: Account[] = [];
  loading = false;
  currentPeriod = this.getCurrentPeriod();
  displayedColumns = ['name', 'amount', 'isRecurring', 'actions'];

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

  get totalAmount(): number {
    return this.accounts.reduce((s, a) => s + a.amount, 0);
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.service.generateRecurring(this.currentPeriod).subscribe({
      next: () => this.fetchAccounts(),
      error: () => this.fetchAccounts(),
    });
  }

  private fetchAccounts() {
    this.service.getByPeriod(this.currentPeriod).subscribe({
      next: (data) => {
        this.accounts = data;
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

  openDialog(account?: Account) {
    const dialogRef = this.dialog.open(AccountDialogComponent, {
      width: '480px',
      data: { account, period: this.currentPeriod },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.loadData();
    });
  }

  deleteAccount(account: Account) {
    this.service.delete(account._id).subscribe({
      next: () => this.loadData(),
    });
  }

  private getCurrentPeriod(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
}
