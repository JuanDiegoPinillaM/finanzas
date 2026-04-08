import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-confirm-email',
  imports: [RouterLink, MatCardModule, MatProgressSpinnerModule],
  template: `
    <div class="auth-container">
      <mat-card class="auth-card">
        <mat-card-header>
          <mat-card-title>Confirmar Correo</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          @if (loading) {
            <div style="display: flex; justify-content: center; padding: 32px;">
              <mat-spinner diameter="40"></mat-spinner>
            </div>
            <p style="text-align: center;">Confirmando tu correo electrónico...</p>
          }
          @if (successMessage) {
            <div class="alert-success">{{ successMessage }}</div>
            <div class="links">
              <a routerLink="/auth/login">Ir a iniciar sesión</a>
            </div>
          }
          @if (errorMessage) {
            <div class="alert-error">{{ errorMessage }}</div>
            <div class="links">
              <a routerLink="/auth/login">Volver al inicio de sesión</a>
            </div>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class ConfirmEmailComponent implements OnInit {
  loading = true;
  successMessage = '';
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.loading = false;
      this.errorMessage = 'Token de confirmación no válido.';
      return;
    }

    this.authService.confirmEmail(token).subscribe({
      next: (res) => {
        this.loading = false;
        this.successMessage = res.message;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Error al confirmar el correo';
      },
    });
  }
}
