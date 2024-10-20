import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';

import {
  NzBreadCrumbComponent,
  NzBreadCrumbModule,
} from 'ng-zorro-antd/breadcrumb';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSliderModule } from 'ng-zorro-antd/slider';

import { AuthService } from '@core/services/requests/auth.service';
import { UnsubscribeDirective } from '@shared/directives/unsubscribe.directive';

@Component({
  selector: 'fd-dashboard-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    NzBreadCrumbComponent,
    NzLayoutModule,
    NzSliderModule,
    NzBreadCrumbModule,
    NzIconModule,
    NzMenuModule,
    RouterOutlet,
  ],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.scss',
})
export class DashboardLayoutComponent extends UnsubscribeDirective {
  public isCollapsed = false;

  public readonly router = inject(Router);
  public readonly authService = inject(AuthService);
  public readonly message = inject(NzMessageService);
  private readonly cdr = inject(ChangeDetectorRef)

  public constructor(){
    super()
  }

  public handleLogOut(): void {
    this.subscribeTo = this.authService.logOut().subscribe(
      {
        next: (): void => {
          this.router.navigate(['/']);
          this.message.create('success', 'Вы успешно вышли из системы!', {
            nzDuration: 2000,
          });

        },
      }
    )

    this.cdr.markForCheck();
  }
}
