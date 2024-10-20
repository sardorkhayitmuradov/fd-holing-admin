import { Routes } from '@angular/router';

import { isAnonymous, isAuthorized } from '@core/guards/auth.guard';
import { ErrorPageComponent } from '@shared/pages/error-page/error-page.component';

import { ClientComponent } from './pages/client/client.component';

export const routes: Routes = [
  {
    path: "",
    pathMatch: "full",
    redirectTo: "documents"
  },
  {
    path: 'documents/:id',
    component: ClientComponent
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
    path: 'error/404',
    component: ErrorPageComponent, // Route for the error page
  },
  {
    path: '**',
    redirectTo: "error/404", // Redirect to the 404 error page for unknown routes
  },
];
