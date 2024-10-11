import { NgModule } from '@angular/core';
import { CommonModule, NgStyle } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ClientComponent } from './client.component';

const routes: Routes = [
  {
    path: '',
    component: ClientComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      {
        path: 'search',
        loadComponent: () =>
          import('./client.component').then((m) => m.ClientComponent),
        data: {
          breadcrumb: 'Главная',
        },
      },
      {
        path: 'search/:id',
        loadComponent: () =>
          import('./client.component').then((m) => m.ClientComponent),
        data: {
          breadcrumb: 'Главная',
        },
      },
    ],
  },
];

@NgModule({
  declarations: [],
  imports: [
    ClientComponent,
    RouterModule.forChild(routes),
    CommonModule,
    NgStyle,
  ],
})
export class MainModule {}
