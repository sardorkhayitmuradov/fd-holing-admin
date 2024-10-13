import { NgModule } from '@angular/core';
import { CommonModule, NgStyle } from '@angular/common';
import { MainComponent } from './main.component';
import { DashboardLayoutComponent } from '../../layouts/dashboard-layout/dashboard-layout.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./dashboard/dashboard.component').then(
            (m) => m.DashboardComponent,
          ),
      },
      {
        path: 'documents',
        loadComponent: () =>
          import('./document-list/document-list.component').then(
            (m) => m.DocumentListComponent,
          ),
        data: {
          breadcrumb: 'Документы',
        },
      },
      {
        path: 'documents/:id',
        loadComponent: () =>
          import('./document-list/document/document.component').then(
            (m) => m.DocumentComponent,
          ),
        data: {
          breadcrumb: 'Документ',
        },
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./settings/settings.component').then(
            (m) => m.SettingsComponent,
          ),
        data: {
          breadcrumb: 'Настройки',
        },
      },
    ],
  },
];

@NgModule({
  declarations: [MainComponent],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    DashboardLayoutComponent,
    NgStyle,
  ],
})
export class MainModule {}
