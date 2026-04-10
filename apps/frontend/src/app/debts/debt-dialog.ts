import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DebtsService } from '../core/services/debts.service';
import { Debt, DebtType } from '../core/models/debt.model';

export interface DebtDialogData {
  type: DebtType;
  debt?: Debt;
  period: string;
}

@Component({
  selector: 'app-debt-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>{{ data.type === 'debtor' ? 'person_outline' : 'receipt_long' }}</mat-icon>
      {{ isEdit ? 'Editar' : 'Nuevo' }} {{ data.type === 'debtor' ? 'Deudor' : 'Deuda' }}
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
          <mat-label>Nombre</mat-label>
          <input matInput formControlName="name" />
          <mat-error>Este campo es requerido</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Monto</mat-label>
          <span matPrefix>$&nbsp;</span>
          <input matInput formControlName="amount" type="number" />
          <mat-error>Ingresa un monto valido</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Descripcion (opcional)</mat-label>
          <textarea matInput formControlName="description" rows="2"></textarea>
        </mat-form-field>
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
    @media (max-width: 600px) { .dialog-form { min-width: auto; } }
  `],
})
export class DebtDialogComponent implements OnInit {
  private service = inject(DebtsService);
  private dialogRef = inject(MatDialogRef<DebtDialogComponent>);
  private cdr = inject(ChangeDetectorRef);
  data: DebtDialogData = inject(MAT_DIALOG_DATA);

  saving = false;
  errorMessage = '';
  isEdit = false;

  form = inject(FormBuilder).nonNullable.group({
    name: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(1)]],
    description: [''],
  });

  ngOnInit() {
    if (this.data.debt) {
      this.isEdit = true;
      const d = this.data.debt;
      this.form.patchValue({ name: d.name, amount: d.amount, description: d.description || '' });
    }
  }

  onSave() {
    if (this.form.invalid) return;
    this.saving = true;
    this.errorMessage = '';
    const values = this.form.getRawValue();

    if (this.isEdit && this.data.debt) {
      this.service.update(this.data.debt._id, values).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => {
          this.saving = false;
          this.errorMessage = err.error?.message || 'Error al guardar';
          this.cdr.detectChanges();
        },
      });
    } else {
      this.service.create({ ...values, type: this.data.type, period: this.data.period }).subscribe({
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
