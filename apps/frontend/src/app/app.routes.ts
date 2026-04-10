import { Route } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { LayoutComponent } from './core/layout/layout';

export const appRoutes: Route[] = [
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        canActivate: [guestGuard],
        loadComponent: () =>
          import('./auth/login/login').then((m) => m.LoginComponent),
      },
      {
        path: 'register',
        canActivate: [guestGuard],
        loadComponent: () =>
          import('./auth/register/register').then((m) => m.RegisterComponent),
      },
      {
        path: 'confirm-email',
        loadComponent: () =>
          import('./auth/confirm-email/confirm-email').then(
            (m) => m.ConfirmEmailComponent,
          ),
      },
      {
        path: 'request-reset-password',
        loadComponent: () =>
          import('./auth/request-reset-password/request-reset-password').then(
            (m) => m.RequestResetPasswordComponent,
          ),
      },
      {
        path: 'reset-password',
        loadComponent: () =>
          import('./auth/reset-password/reset-password').then(
            (m) => m.ResetPasswordComponent,
          ),
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        data: { breadcrumb: 'Dashboard' },
        loadComponent: () =>
          import('./dashboard/dashboard').then((m) => m.DashboardComponent),
      },
      {
        path: 'transactions',
        data: { breadcrumb: 'Ingresos y Egresos' },
        loadComponent: () =>
          import('./transactions/transactions').then(
            (m) => m.TransactionsComponent,
          ),
      },
      {
        path: 'accounts',
        data: { breadcrumb: 'Dinero' },
        loadComponent: () =>
          import('./accounts/accounts').then((m) => m.AccountsComponent),
      },
      {
        path: 'debts',
        data: { breadcrumb: 'Deudores y Deudas' },
        loadComponent: () =>
          import('./debts/debts').then((m) => m.DebtsComponent),
      },
      {
        path: 'investments',
        data: { breadcrumb: 'Inversiones' },
        loadComponent: () =>
          import('./investments/investments').then(
            (m) => m.InvestmentsComponent,
          ),
      },
      {
        path: 'credits',
        data: { breadcrumb: 'Creditos' },
        loadComponent: () =>
          import('./credits/credits').then((m) => m.CreditsComponent),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'auth/login' },
];
