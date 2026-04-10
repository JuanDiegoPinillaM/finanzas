import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TransactionsService } from '../core/services/transactions.service';
import { Transaction, TransactionType } from '../core/models/transaction.model';

export interface TransactionDialogData {
  type: TransactionType;
  transaction?: Transaction;
  period: string;
}

@Component({
  selector: 'app-transaction-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>{{ data.type === 'income' ? 'arrow_downward' : 'arrow_upward' }}</mat-icon>
      {{ isEdit ? 'Editar' : 'Nuevo' }} {{ data.type === 'income' ? 'Ingreso' : 'Egreso' }}
    </h2>

    <mat-dialog-content>
      @if (errorMessage) {
        <div class="alert-error">
          <mat-icon>error</mat-icon>
          <span>{{ errorMessage }}</span>
        </div>
      }

      <form [formGroup]="form" class="dialog-form">
        <mat-form-field appearance="outline">
          <mat-label>{{ data.type === 'income' ? 'Fuente de Ingreso' : 'Fuente de Egreso' }}</mat-label>
          <input matInput formControlName="source" />
          <mat-error>Este campo es requerido</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Cantidad</mat-label>
          <span matPrefix>$&nbsp;</span>
          <input matInput formControlName="amount" type="number" />
          <mat-error>Ingresa una cantidad valida</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Fecha de Pago</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="dueDate" />
          <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
          <mat-error>La fecha es requerida</mat-error>
        </mat-form-field>

        <div class="toggle-row">
          <mat-slide-toggle formControlName="isRecurring" color="accent">
            Recurrente (se repite cada mes)
          </mat-slide-toggle>

          <mat-slide-toggle formControlName="isPaid" color="primary">
            Pagado
          </mat-slide-toggle>
        </div>

        <mat-form-field appearance="outline">
          <mat-label>Notas (opcional)</mat-label>
          <textarea matInput formControlName="notes" rows="2"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button
        mat-raised-button
        color="primary"
        [disabled]="form.invalid || saving"
        (click)="onSave()"
      >
        @if (saving) {
          <mat-spinner diameter="20"></mat-spinner>
        } @else {
          {{ isEdit ? 'Guardar' : 'Crear' }}
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    h2[mat-dialog-title] {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 20px;
      font-weight: 600;
    }

    .dialog-form {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 400px;
      padding-top: 8px;
    }

    .toggle-row {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 8px;
    }

    @media (max-width: 600px) {
      .dialog-form {
        min-width: auto;
      }
    }
  `],
})
export class TransactionDialogComponent implements OnInit {
  private transactionsService = inject(TransactionsService);
  private dialogRef = inject(MatDialogRef<TransactionDialogComponent>);
  private cdr = inject(ChangeDetectorRef);
  data: TransactionDialogData = inject(MAT_DIALOG_DATA);

  saving = false;
  errorMessage = '';
  isEdit = false;

  form = inject(FormBuilder).nonNullable.group({
    source: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(1)]],
    dueDate: [new Date(), Validators.required],
    isRecurring: [false],
    isPaid: [false],
    notes: [''],
  });

  ngOnInit() {
    if (this.data.transaction) {
      this.isEdit = true;
      const t = this.data.transaction;
      this.form.patchValue({
        source: t.source,
        amount: t.amount,
        dueDate: new Date(t.dueDate),
        isRecurring: t.isRecurring,
        isPaid: t.isPaid,
        notes: t.notes || '',
      });
    }
  }

  onSave() {
    if (this.form.invalid) return;

    this.saving = true;
    this.errorMessage = '';

    const values = this.form.getRawValue();
    const dueDate = new Date(values.dueDate);
    const payload = {
      source: values.source,
      amount: values.amount,
      dueDate: dueDate.toISOString(),
      isRecurring: values.isRecurring,
      isPaid: values.isPaid,
      notes: values.notes || undefined,
    };

    if (this.isEdit && this.data.transaction) {
      this.transactionsService.update(this.data.transaction._id, payload).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => {
          this.saving = false;
          this.errorMessage = err.error?.message || 'Error al guardar';
          this.cdr.detectChanges();
        },
      });
    } else {
      this.transactionsService
        .create({
          ...payload,
          type: this.data.type,
          period: this.data.period,
        })
        .subscribe({
          next: () => this.dialogRef.close(true),
          error: (err) => {
            this.saving = false;
            this.errorMessage = err.error?.message || 'Error al crear';
            this.cdr.detectChanges();
          },
        });
    }
  }
}
