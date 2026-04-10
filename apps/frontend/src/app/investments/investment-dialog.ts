import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { InvestmentsService } from '../core/services/investments.service';
import { Investment, InvestmentType } from '../core/models/investment.model';

export interface InvestmentDialogData {
  type: InvestmentType;
  investment?: Investment;
  period: string;
}

@Component({
  selector: 'app-investment-dialog',
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
      <mat-icon>{{ data.type === 'cdt' ? 'savings' : 'currency_exchange' }}</mat-icon>
      {{ isEdit ? 'Editar' : 'Nuevo' }} {{ data.type === 'cdt' ? 'CDT' : 'Divisa' }}
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
          <mat-label>Valor</mat-label>
          <span matPrefix>$&nbsp;</span>
          <input matInput formControlName="value" type="number" />
          <mat-error>Ingresa un valor valido</mat-error>
        </mat-form-field>

        @if (data.type === 'cdt') {
          <mat-form-field appearance="outline">
            <mat-label>Rendimiento Mensual</mat-label>
            <span matPrefix>$&nbsp;</span>
            <input matInput formControlName="monthlyReturn" type="number" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Rendimiento Anual</mat-label>
            <span matPrefix>$&nbsp;</span>
            <input matInput formControlName="annualReturn" type="number" />
          </mat-form-field>
        }

        @if (data.type === 'currency') {
          <mat-form-field appearance="outline">
            <mat-label>Valor en COP</mat-label>
            <span matPrefix>$&nbsp;</span>
            <input matInput formControlName="valueCOP" type="number" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Tasa de Cambio</mat-label>
            <span matPrefix>$&nbsp;</span>
            <input matInput formControlName="exchangeRate" type="number" />
          </mat-form-field>
        }
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
    .dialog-form { display: flex; flex-direction: column; gap: 4px; min-width: 420px; padding-top: 8px; }
    @media (max-width: 600px) { .dialog-form { min-width: auto; } }
  `],
})
export class InvestmentDialogComponent implements OnInit {
  private service = inject(InvestmentsService);
  private dialogRef = inject(MatDialogRef<InvestmentDialogComponent>);
  private cdr = inject(ChangeDetectorRef);
  data: InvestmentDialogData = inject(MAT_DIALOG_DATA);

  saving = false;
  errorMessage = '';
  isEdit = false;

  form = inject(FormBuilder).nonNullable.group({
    name: ['', Validators.required],
    value: [0, [Validators.required, Validators.min(0)]],
    monthlyReturn: [0],
    annualReturn: [0],
    valueCOP: [0],
    exchangeRate: [0],
  });

  ngOnInit() {
    if (this.data.investment) {
      this.isEdit = true;
      const i = this.data.investment;
      this.form.patchValue({
        name: i.name,
        value: i.value,
        monthlyReturn: i.monthlyReturn || 0,
        annualReturn: i.annualReturn || 0,
        valueCOP: i.valueCOP || 0,
        exchangeRate: i.exchangeRate || 0,
      });
    }
  }

  onSave() {
    if (this.form.invalid) return;
    this.saving = true;
    this.errorMessage = '';
    const values = this.form.getRawValue();

    const payload: Record<string, unknown> = { name: values.name, value: values.value };
    if (this.data.type === 'cdt') {
      payload['monthlyReturn'] = values.monthlyReturn;
      payload['annualReturn'] = values.annualReturn;
    } else {
      payload['valueCOP'] = values.valueCOP;
      payload['exchangeRate'] = values.exchangeRate;
    }

    if (this.isEdit && this.data.investment) {
      this.service.update(this.data.investment._id, payload as any).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => {
          this.saving = false;
          this.errorMessage = err.error?.message || 'Error al guardar';
          this.cdr.detectChanges();
        },
      });
    } else {
      this.service.create({ ...payload, type: this.data.type, period: this.data.period } as any).subscribe({
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
