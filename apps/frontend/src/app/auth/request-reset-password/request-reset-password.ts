import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-request-reset-password',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="auth-container">
      <mat-card class="auth-card">
        <mat-card-header>
          <mat-card-title>Recuperar Contraseña</mat-card-title>
          <mat-card-subtitle>Ingresa tu correo para recibir un enlace</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          @if (successMessage) {
            <div class="alert-success">{{ successMessage }}</div>
          }
          @if (errorMessage) {
            <div class="alert-error">{{ errorMessage }}</div>
          }

          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline">
              <mat-label>Correo electrónico</mat-label>
              <input matInput formControlName="email" type="email" />
              @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
                <mat-error>El correo es requerido</mat-error>
              }
              @if (form.get('email')?.hasError('email') && form.get('email')?.touched) {
                <mat-error>Correo inválido</mat-error>
              }
            </mat-form-field>

            <div class="actions">
              <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || loading">
                @if (loading) {
                  <mat-spinner diameter="20"></mat-spinner>
                } @else {
                  Enviar enlace
                }
              </button>
            </div>
          </form>

          <div class="links">
            <a routerLink="/auth/login">Volver al inicio de sesión</a>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class RequestResetPasswordComponent {
  private authService = inject(AuthService);

  loading = false;
  successMessage = '';
  errorMessage = '';

  form = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  onSubmit() {
    if (this.form.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    this.authService.requestResetPassword(this.form.getRawValue().email).subscribe({
      next: (res) => {
        this.loading = false;
        this.successMessage = res.message;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Error al enviar el enlace';
      },
    });
  }
}
