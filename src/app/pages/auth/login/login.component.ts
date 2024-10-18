import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import { NzAlertComponent } from 'ng-zorro-antd/alert';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzCheckboxGroupComponent } from 'ng-zorro-antd/checkbox';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import {
  NzInputDirective,
  NzInputGroupComponent,
  NzInputGroupWhitSuffixOrPrefixDirective,
} from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalComponent } from 'ng-zorro-antd/modal';
import { NzResultComponent } from 'ng-zorro-antd/result';
import { NzTagComponent } from 'ng-zorro-antd/tag';
import { Subscription } from 'rxjs';

import { StringOrJsonPipe } from '@shared/pipes/string-or-json.pipe';
import { FormGroupFrom } from '@shared/types/form-group.types';
import { AuthService } from '@app/core/services/requests/auth.service';

export interface ILoginForm {
  username: string;
  password: string;
}

@Component({
  selector: 'cc-login',
  standalone: true,
  imports: [
    NzInputDirective,
    NzButtonComponent,
    NzTagComponent,
    NzIconDirective,
    FormsModule,
    NzInputGroupWhitSuffixOrPrefixDirective,
    NzInputGroupComponent,
    NzResultComponent,
    ReactiveFormsModule,
    NzAlertComponent,
    NzCheckboxGroupComponent,
    NzModalComponent,
    StringOrJsonPipe,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit, OnDestroy {
  public passwordVisible = false;
  public loading = false;
  public messages: string[] = [];

  public readonly fb = inject(FormBuilder);
  public readonly router = inject(Router);
  public readonly message = inject(NzMessageService);
  public readonly authService = inject(AuthService);

  // public readonly authService = inject(AuthorizationService);
  public loginForm = this.fb.group<FormGroupFrom<ILoginForm>>({
    username: ['Иван Иванович', [Validators.required]],
    password: ['Pass1234_5', [Validators.required]],
  });

  private loginSub: Subscription | undefined;

  public ngOnInit(): void {
    console.log('LoginComponent initialized');
  }

  public login(): void {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.loginSub = this.authService
      .login(this.loginForm.getRawValue() as ILoginForm)
      .subscribe({
        next: (response): void => {
          console.log(response);
          this.loading = false;
          this.createBasicMessage();
          this.router.navigate(['/admin/documents']);
        },
        error: (err): void => {
          this.messages.push(
            err.error?.message || 'Ошибка при входе в систему',
          );
          this.loading = false;
        },
      });
  }

  public ngOnDestroy(): void {
    this.loginSub?.unsubscribe();
  }

  private createBasicMessage(): void {
    this.message.create('success', 'Вы успешно вошли в систему!', {
      nzDuration: 2000,
    });
  }
}
