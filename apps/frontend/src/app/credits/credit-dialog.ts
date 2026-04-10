import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { CreditsService } from '../core/services/credits.service';
import { Credit } from '../core/models/credit.model';

export interface CreditDialogData {
  credit?: Credit;
  period: string;
}

@Component({
  selector: 'app-credit-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>credit_score</mat-icon>
      {{ isEdit ? 'Editar' : 'Nuevo' }} Credito
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
          <mat-label>Lugar</mat-label>
          <input matInput formControlName="location" />
          <mat-error>Este campo es requerido</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Monto Disponible</mat-label>
          <span matPrefix>$&nbsp;</span>
          <input matInput formControlName="amount" type="number" />
          <mat-error>Ingresa un monto valido</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Tipo</mat-label>
          <mat-select formControlName="type">
            <mat-option value="Libre inversión">Libre inversion</mat-option>
            <mat-option value="Consumo">Consumo</mat-option>
            <mat-option value="Hipotecario">Hipotecario</mat-option>
            <mat-option value="Vehiculo">Vehiculo</mat-option>
            <mat-option value="Educativo">Educativo</mat-option>
            <mat-option value="Otro">Otro</mat-option>
          </mat-select>
          <mat-error>Selecciona un tipo</mat-error>
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
export class CreditDialogComponent implements OnInit {
  private service = inject(CreditsService);
  private dialogRef = inject(MatDialogRef<CreditDialogComponent>);
  private cdr = inject(ChangeDetectorRef);
  data: CreditDialogData = inject(MAT_DIALOG_DATA);

  saving = false;
  errorMessage = '';
  isEdit = false;

  form = inject(FormBuilder).nonNullable.group({
    location: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(0)]],
    type: ['', Validators.required],
  });

  ngOnInit() {
    if (this.data.credit) {
      this.isEdit = true;
      const c = this.data.credit;
      this.form.patchValue({ location: c.location, amount: c.amount, type: c.type });
    }
  }

  onSave() {
    if (this.form.invalid) return;
    this.saving = true;
    this.errorMessage = '';
    const values = this.form.getRawValue();

    if (this.isEdit && this.data.credit) {
      this.service.update(this.data.credit._id, values).subscribe({
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
