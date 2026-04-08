import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
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
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss',
})
export class ResetPasswordComponent implements OnInit {
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

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
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.error?.message || 'Error al restablecer la contrasena';
          this.cdr.detectChanges();
        },
      });
  }
}
