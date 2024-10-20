import { Routes } from '@angular/router';

import { isAnonymous, isAuthorized } from '@core/guards/auth.guard';

export const routes: Routes = [
  {
    path: "",
    pathMatch: "full",
    redirectTo: "auth"
  },
  {
    path: 'auth',
    canMatch: [isAnonymous],
    loadChildren: () =>
      import('./pages/auth/auth-routing.module').then(
        (m) => m.AuthRoutingModule,
      ),
  },
  {
    path: 'admin',
    canMatch: [isAuthorized],
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
