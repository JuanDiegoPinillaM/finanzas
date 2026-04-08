import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="auth-container">
      <mat-card class="auth-card">
        <mat-card-header>
          <mat-card-title>Nueva Contraseña</mat-card-title>
          <mat-card-subtitle>Ingresa tu nueva contraseña</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          @if (successMessage) {
            <div class="alert-success">{{ successMessage }}</div>
            <div class="links">
              <a routerLink="/auth/login">Ir a iniciar sesión</a>
            </div>
          }
          @if (errorMessage) {
            <div class="alert-error">{{ errorMessage }}</div>
          }

          @if (!successMessage) {
            <form [formGroup]="form" (ngSubmit)="onSubmit()">
              <mat-form-field appearance="outline">
                <mat-label>Nueva contraseña</mat-label>
                <input matInput formControlName="newPassword" [type]="hidePassword ? 'password' : 'text'" />
                <button mat-icon-button matSuffix type="button" (click)="hidePassword = !hidePassword">
                  <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                @if (form.get('newPassword')?.hasError('required') && form.get('newPassword')?.touched) {
                  <mat-error>La contraseña es requerida</mat-error>
                }
                @if (form.get('newPassword')?.hasError('minlength') && form.get('newPassword')?.touched) {
                  <mat-error>Mínimo 8 caracteres</mat-error>
                }
              </mat-form-field>

              <div class="actions">
                <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || loading">
                  @if (loading) {
                    <mat-spinner diameter="20"></mat-spinner>
                  } @else {
                    Restablecer contraseña
                  }
                </button>
              </div>
            </form>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class ResetPasswordComponent implements OnInit {
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  hidePassword = true;
  loading = false;
  successMessage = '';
  errorMessage = '';
  private token = '';

  form = inject(FormBuilder).nonNullable.group({
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
  });

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    if (!this.token) {
      this.router.navigate(['/auth/login']);
    }
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    this.authService
      .resetPassword(this.token, this.form.getRawValue().newPassword)
      .subscribe({
        next: (res) => {
          this.loading = false;
          this.successMessage = res.message;
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.error?.message || 'Error al restablecer la contraseña';
        },
      });
  }
}
