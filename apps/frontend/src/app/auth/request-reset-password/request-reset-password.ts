import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-request-reset-password',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './request-reset-password.html',
  styleUrl: './request-reset-password.scss',
})
export class RequestResetPasswordComponent {
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

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
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Error al enviar el enlace';
        this.cdr.detectChanges();
      },
    });
  }
}
