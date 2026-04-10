import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { CreditsService } from '../core/services/credits.service';
import { Credit } from '../core/models/credit.model';
import { CreditDialogComponent } from './credit-dialog';

@Component({
  selector: 'app-credits',
  imports: [
    DecimalPipe,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatDialogModule,
    MatChipsModule,
  ],
  templateUrl: './credits.html',
  styleUrl: './credits.scss',
})
export class CreditsComponent implements OnInit {
  private service = inject(CreditsService);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);

  credits: Credit[] = [];
  loading = false;
  currentPeriod = this.getCurrentPeriod();
  displayedColumns = ['location', 'amount', 'type', 'actions'];

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
    return this.credits.reduce((s, c) => s + c.amount, 0);
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.service.getByPeriod(this.currentPeriod).subscribe({
      next: (data) => {
        this.credits = data;
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

  openDialog(credit?: Credit) {
    const dialogRef = this.dialog.open(CreditDialogComponent, {
      width: '480px',
      data: { credit, period: this.currentPeriod },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.loadData();
    });
  }

  deleteCredit(credit: Credit) {
    this.service.delete(credit._id).subscribe({
      next: () => this.loadData(),
    });
  }

  private getCurrentPeriod(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
}
