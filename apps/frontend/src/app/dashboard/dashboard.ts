import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [MatToolbarModule, MatButtonModule],
  template: `
    <mat-toolbar color="primary">
      <span>Finanzas App</span>
      <span style="flex: 1"></span>
      <span style="margin-right: 16px; font-size: 14px;">
        {{ authService.user()?.firstName }} {{ authService.user()?.lastName }}
        ({{ authService.user()?.role }})
      </span>
      <button mat-button (click)="authService.logout()">Cerrar sesión</button>
    </mat-toolbar>
    <div style="padding: 24px;">
      <h2>Bienvenido, {{ authService.user()?.firstName }}!</h2>
      <p>Panel de control - Finanzas App</p>
    </div>
  `,
})
export class DashboardComponent {
  constructor(public authService: AuthService) {}
}
