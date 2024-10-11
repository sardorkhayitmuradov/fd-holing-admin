import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  }, {
    path: 'login',
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent),
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
})
export class AuthRoutingModule {}
