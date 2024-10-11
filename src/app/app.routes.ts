import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./pages/auth/auth-routing.module').then(
        (m) => m.AuthRoutingModule,
      ),
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./pages/main/main.module').then((m) => m.MainModule),
    data: {
      breadcrumb: 'Главная',
    },
  },
  {
    path: '**',
    redirectTo: '/',
  },
];
