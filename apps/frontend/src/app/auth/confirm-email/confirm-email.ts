import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-confirm-email',
  imports: [RouterLink, MatProgressSpinnerModule, MatIconModule],
  templateUrl: './confirm-email.html',
  styleUrl: './confirm-email.scss',
})
export class ConfirmEmailComponent implements OnInit {
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  loading = true;
  successMessage = '';
  errorMessage = '';

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
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Error al confirmar el correo';
        this.cdr.detectChanges();
      },
    });
  }
}
