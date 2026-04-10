import { Component, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../services/auth.service';
import { BreadcrumbService } from '../services/breadcrumb.service';

export interface NavItem {
  icon: string;
  label: string;
  route: string;
  roles?: string[];
}

@Component({
  selector: 'app-layout',
  imports: [
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatTooltipModule,
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class LayoutComponent {
  authService = inject(AuthService);
  breadcrumbService = inject(BreadcrumbService);

  sidebarCollapsed = signal(false);

  navItems: NavItem[] = [
    { icon: 'dashboard', label: 'Dashboard', route: '/dashboard' },
    { icon: 'swap_vert', label: 'Ingresos y Egresos', route: '/transactions' },
    { icon: 'account_balance_wallet', label: 'Dinero', route: '/accounts' },
    { icon: 'balance', label: 'Deudores y Deudas', route: '/debts' },
    { icon: 'savings', label: 'Inversiones', route: '/investments' },
    { icon: 'credit_score', label: 'Creditos', route: '/credits' },
    { icon: 'people', label: 'Usuarios', route: '/users', roles: ['admin'] },
  ];

  get visibleNavItems(): NavItem[] {
    const role = this.authService.user()?.role;
    return this.navItems.filter(
      (item) => !item.roles || (role && item.roles.includes(role)),
    );
  }

  toggleSidebar() {
    this.sidebarCollapsed.update((v) => !v);
  }
}
