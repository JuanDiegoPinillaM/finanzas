import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AccountsService } from '../core/services/accounts.service';
import { Account } from '../core/models/account.model';

export interface AccountDialogData {
  account?: Account;
  period: string;
}

@Component({
  selector: 'app-account-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>account_balance_wallet</mat-icon>
      {{ isEdit ? 'Editar' : 'Nueva' }} Cuenta
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
          <mat-label>Nombre de la Cuenta</mat-label>
          <input matInput formControlName="name" />
          <mat-error>Este campo es requerido</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Monto</mat-label>
          <span matPrefix>$&nbsp;</span>
          <input matInput formControlName="amount" type="number" />
          <mat-error>Ingresa un monto valido</mat-error>
        </mat-form-field>

        <mat-slide-toggle formControlName="isRecurring" color="accent">
          Recurrente (se repite cada mes)
        </mat-slide-toggle>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-raised-button color="primary" [disabled]="form.invalid || saving" (click)="onSave()">
        @if (saving) {
          <mat-spinner diameter="20"></mat-spinner>
        } @else {
          {{ isEdit ? 'Guardar' : 'Crear' }}
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    h2[mat-dialog-title] { display: flex; align-items: center; gap: 8px; font-size: 20px; font-weight: 600; }
    .dialog-form { display: flex; flex-direction: column; gap: 4px; min-width: 400px; padding-top: 8px; }
    mat-slide-toggle { margin-bottom: 8px; }
    @media (max-width: 600px) { .dialog-form { min-width: auto; } }
  `],
})
export class AccountDialogComponent implements OnInit {
  private service = inject(AccountsService);
  private dialogRef = inject(MatDialogRef<AccountDialogComponent>);
  private cdr = inject(ChangeDetectorRef);
  data: AccountDialogData = inject(MAT_DIALOG_DATA);

  saving = false;
  errorMessage = '';
  isEdit = false;

  form = inject(FormBuilder).nonNullable.group({
    name: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(0)]],
    isRecurring: [false],
  });

  ngOnInit() {
    if (this.data.account) {
      this.isEdit = true;
      this.form.patchValue({ name: this.data.account.name, amount: this.data.account.amount, isRecurring: this.data.account.isRecurring });
    }
  }

  onSave() {
    if (this.form.invalid) return;
    this.saving = true;
    this.errorMessage = '';
    const values = this.form.getRawValue();

    if (this.isEdit && this.data.account) {
      this.service.update(this.data.account._id, values).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => {
          this.saving = false;
          this.errorMessage = err.error?.message || 'Error al guardar';
          this.cdr.detectChanges();
        },
      });
    } else {
      this.service.create({ ...values, period: this.data.period }).subscribe({
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
